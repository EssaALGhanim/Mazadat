package org.example.mazadat.Service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.BaseDirection;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Util.AppTime;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import com.ibm.icu.text.ArabicShaping;
import com.ibm.icu.text.ArabicShapingException;
import com.ibm.icu.text.Bidi;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;

    public byte[] generateReceiptPDF(Integer auctionId, Integer buyerId, String language) {
        boolean arabic = isArabicLanguage(language);

        // Fetch auction
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            throw new ApiException("Auction not found");
        }

        // Verify auction has ended
        LocalDateTime now = AppTime.now();
        if (auction.getEndDate() != null && now.isBefore(auction.getEndDate())) {
            throw new ApiException("Auction has not ended yet. Receipt can only be downloaded after the auction ends.");
        }

        boolean failedBelowReserve = auction.getReservePrice() != null
                && (auction.getCurrentPrice() == null || auction.getCurrentPrice() < auction.getReservePrice());
        if (failedBelowReserve) {
            auction.setStatus("FAILED_BELOW_RESERVE");
            auction.setHighestBidder(null);
            auction.setHighestBidderEmail(null);
            auctionRepository.save(auction);
            throw new ApiException("Auction failed below reserve price");
        }

        // Fetch buyer
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }

        // Verify buyer is the winner
        if (auction.getHighestBidder() == null || !auction.getHighestBidder().equals(buyer.getUser().getUsername())) {
            throw new ApiException("Only the auction winner can generate a receipt");
        }

        // Update auction status to ENDED if not already
        if (auction.getStatus() == null || !auction.getStatus().equals("ENDED")) {
            auction.setStatus("ENDED");
            auctionRepository.save(auction);
        }

        byte[] pdfBytes = createPDF(auction, buyer, arabic);
        if (pdfBytes.length < 16) {
            throw new ApiException("Generated receipt is empty");
        }

        String pdfHeader = new String(pdfBytes, 0, 4, StandardCharsets.US_ASCII);
        if (!"%PDF".equals(pdfHeader)) {
            throw new ApiException("Generated receipt is invalid");
        }

        return pdfBytes;
    }

    private byte[] createPDF(Auction auction, Buyer buyer, boolean arabic) {
        try {
            ReceiptTexts texts = resolveTexts(arabic ? "ar" : "en");
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc);
            PdfFont unicodeFont = loadUnicodeFont();
            doc.setFont(unicodeFont);

            // Add logo
            try {
                ClassPathResource resource = new ClassPathResource("static/logos/mazadat_green_logo.png");
                InputStream inputStream = resource.getInputStream();
                ImageData imageData = ImageDataFactory.create(inputStreamToByteArray(inputStream));
                Image logo = new Image(imageData).setWidth(100).setHeight(100);
                doc.add(logo);
            } catch (Exception e) {
                // Logo not found, continue without it
            }

            // Title
            Paragraph title = new Paragraph(renderText(texts.title(), arabic))
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            doc.add(title);

            // Receipt date
            String formattedDate = AppTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            Paragraph dateP = new Paragraph(renderText(texts.receiptGeneratedLabel() + " " + formattedDate, arabic))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            doc.add(dateP);

            // Divider
            doc.add(new Paragraph("_".repeat(80)).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Auction Details
            Paragraph auctionTitle = sectionTitle(renderText(texts.auctionDetailsTitle(), arabic), arabic);
            doc.add(auctionTitle);

            Table auctionTable = new Table(2).setWidth(500);
            addTableRow(auctionTable, renderText(texts.auctionIdLabel(), arabic), String.valueOf(auction.getId()), unicodeFont, arabic);
            addTableRow(auctionTable, renderText(texts.auctionNameLabel(), arabic), auction.getTitle() != null ? auction.getTitle() : fallback(arabic, "N/A", "غير متوفر"), unicodeFont, arabic);
            addTableRow(auctionTable, renderText(texts.auctionDescriptionLabel(), arabic), auction.getDescription() != null ? auction.getDescription() : fallback(arabic, "N/A", "غير متوفر"), unicodeFont, arabic);
            addTableRow(auctionTable, renderText(texts.sellingPriceLabel(), arabic), auction.getCurrentPrice() + (arabic ? " ر.س" : " SR"), unicodeFont, arabic);
            addTableRow(auctionTable, renderText(texts.auctionEndDateLabel(), arabic), auction.getEndDate() != null ?
                    auction.getEndDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : fallback(arabic, "N/A", "غير متوفر"), unicodeFont, arabic);
            doc.add(auctionTable);

            // Seller Details
            Paragraph sellerTitle = sectionTitle(renderText(texts.sellerInformationTitle(), arabic), arabic);
            doc.add(sellerTitle);

            Table sellerTable = new Table(2).setWidth(500);
            addTableRow(sellerTable, renderText(texts.sellerNameLabel(), arabic), auction.getSeller().getUser().getUsername(), unicodeFont, arabic);
            addTableRow(sellerTable, renderText(texts.sellerEmailLabel(), arabic), auction.getSeller().getUser().getEmail(), unicodeFont, arabic);
            addTableRow(sellerTable, renderText(texts.ibanLabel(), arabic), auction.getAuctionHouse() != null && auction.getAuctionHouse().getIban() != null ?
                    auction.getAuctionHouse().getIban() : fallback(arabic, "Not provided", "غير متوفر"), unicodeFont, arabic);
            doc.add(sellerTable);

            // Buyer Details
            Paragraph buyerTitle = sectionTitle(renderText(texts.buyerInformationTitle(), arabic), arabic);
            doc.add(buyerTitle);

            Table buyerTable = new Table(2).setWidth(500);
            addTableRow(buyerTable, renderText(texts.buyerNameLabel(), arabic), buyer.getUser().getUsername(), unicodeFont, arabic);
            addTableRow(buyerTable, renderText(texts.buyerEmailLabel(), arabic), buyer.getUser().getEmail(), unicodeFont, arabic);
            addTableRow(buyerTable, renderText(texts.phoneLabel(), arabic), buyer.getUser().getPhoneNumber() != null ?
                    buyer.getUser().getPhoneNumber() : fallback(arabic, "Not provided", "غير متوفر"), unicodeFont, arabic);
            doc.add(buyerTable);

            // Footer
            doc.add(new Paragraph("_".repeat(80))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20)
                    .setMarginBottom(10));
            Paragraph footer = new Paragraph(renderText(texts.footer(), arabic))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10);
            doc.add(footer);

            // Close document - this will automatically close PdfDocument and Writer
            doc.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new ApiException("Error generating PDF: " + e.getMessage());
        }
    }

    ReceiptTexts resolveTexts(String language) {
        return isArabicLanguage(language) ? ReceiptTexts.arabic() : ReceiptTexts.english();
    }

    private Paragraph labelCell(String text, PdfFont font, boolean arabic) {
        return new Paragraph(text)
                .setFont(font)
                .setBaseDirection(arabic ? BaseDirection.RIGHT_TO_LEFT : BaseDirection.LEFT_TO_RIGHT)
                .setTextAlignment(arabic ? TextAlignment.RIGHT : TextAlignment.LEFT);
    }

    private Paragraph sectionTitle(String text, boolean arabic) {
        return new Paragraph(text)
                .setBold()
                .setFontSize(14)
                .setMarginTop(20)
                .setMarginBottom(10)
                .setBaseDirection(arabic ? BaseDirection.RIGHT_TO_LEFT : BaseDirection.LEFT_TO_RIGHT)
                .setTextAlignment(arabic ? TextAlignment.RIGHT : TextAlignment.LEFT);
    }

    private void addTableRow(Table table, String label, String value, PdfFont font, boolean arabic) {
        if (arabic) {
            table.addCell(valueCell(value, font));
            table.addCell(labelCell(label, font, true));
            return;
        }

        table.addCell(labelCell(label, font, false));
        table.addCell(valueCell(value, font));
    }

    private Paragraph valueCell(String text, PdfFont font) {
        String safe = text == null ? "" : text;
        boolean rtl = containsArabic(safe);
        String printable = rtl ? prepareArabicForPdf(safe) : safe;

        return new Paragraph(printable)
                .setFont(font)
                // iText core (without pdfCalligraph) can render Arabic in reversed order.
                // We keep visual RTL alignment but feed pre-ordered text for readability.
                .setBaseDirection(BaseDirection.LEFT_TO_RIGHT)
                .setTextAlignment(rtl ? TextAlignment.RIGHT : TextAlignment.LEFT);
    }

    private String prepareArabicForPdf(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        try {
            // 1) Shape Arabic letters to contextual forms (connect characters)
            ArabicShaping shaping = new ArabicShaping(
                    ArabicShaping.LETTERS_SHAPE | ArabicShaping.LENGTH_GROW_SHRINK
            );
            String shaped = shaping.shape(text);

            // 2) Reorder text for visual rendering in engines without full complex script support
            Bidi bidi = new Bidi(shaped, Bidi.DIRECTION_RIGHT_TO_LEFT);
            return bidi.writeReordered(Bidi.OPTION_REMOVE_CONTROLS);
        } catch (ArabicShapingException e) {
            // Safe fallback: keep original text
            return text;
        }
    }

    private String renderText(String text, boolean arabic) {
        return arabic ? prepareArabicForPdf(text) : text;
    }

    private String fallback(boolean arabic, String english, String arabicText) {
        return arabic ? arabicText : english;
    }

    private boolean isArabicLanguage(String language) {
        if (language == null || language.isBlank()) {
            return false;
        }

        String normalized = language.toLowerCase(Locale.ROOT).trim();
        return normalized.startsWith("ar");
    }

    private boolean containsArabic(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        return text.matches(".*[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF].*");
    }

    private PdfFont loadUnicodeFont() {
        try {
            // If you add a bundled font later, keep this first.
            ClassPathResource bundledFont = new ClassPathResource("static/fonts/NotoNaskhArabic-Regular.ttf");
            if (bundledFont.exists()) {
                return PdfFontFactory.createFont(
                        inputStreamToByteArray(bundledFont.getInputStream()),
                        PdfEncodings.IDENTITY_H,
                        PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
                );
            }
        } catch (Exception ignored) {
            // Fallbacks below
        }

        try {
            // Windows fallback for local development/runtime.
            return PdfFontFactory.createFont(
                    "C:/Windows/Fonts/arial.ttf",
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
            );
        } catch (Exception ignored) {
            // Final fallback
        }

        try {
            return PdfFontFactory.createFont();
        } catch (Exception e) {
            throw new ApiException("Unable to load a PDF font: " + e.getMessage());
        }
    }

    private byte[] inputStreamToByteArray(InputStream is) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        return buffer.toByteArray();
    }
}

record ReceiptTexts(
        String title,
        String receiptGeneratedLabel,
        String auctionDetailsTitle,
        String auctionIdLabel,
        String auctionNameLabel,
        String auctionDescriptionLabel,
        String sellingPriceLabel,
        String auctionEndDateLabel,
        String sellerInformationTitle,
        String sellerNameLabel,
        String sellerEmailLabel,
        String ibanLabel,
        String buyerInformationTitle,
        String buyerNameLabel,
        String buyerEmailLabel,
        String phoneLabel,
        String footer
) {
    static ReceiptTexts english() {
        return new ReceiptTexts(
                "MAZADAT AUCTION RECEIPT",
                "Receipt Generated:",
                "AUCTION DETAILS",
                "Auction ID:",
                "Auction Name:",
                "Auction Description:",
                "Selling Price:",
                "Auction End Date:",
                "SELLER INFORMATION",
                "Seller Name:",
                "Seller Email:",
                "IBAN:",
                "BUYER INFORMATION",
                "Buyer Name:",
                "Buyer Email:",
                "Phone:",
                "Thank you for using Mazadat! This is an official receipt."
        );
    }

    static ReceiptTexts arabic() {
        return new ReceiptTexts(
                "إيصال مزاد مزادات",
                "تم إنشاء الإيصال:",
                "تفاصيل المزاد",
                "رقم المزاد:",
                "اسم المزاد:",
                "وصف المزاد:",
                "سعر البيع:",
                "تاريخ انتهاء المزاد:",
                "معلومات البائع",
                "اسم البائع:",
                "البريد الإلكتروني للبائع:",
                "رقم الآيبان:",
                "معلومات المشتري",
                "اسم المشتري:",
                "البريد الإلكتروني للمشتري:",
                "رقم الهاتف:",
                "شكراً لاستخدام مزادات! هذا إيصال رسمي."
        );
    }
}

