package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${mazadat.mail.from:admin@mazadat.org}")
    private String fromEmail;

    // ─── Public methods ───────────────────────────────────────────────────────

    @Async
    public void sendOutbidEmail(String toEmail, String username, String auctionTitle, double newAmount) {
        String subject = "You've been outbid | تم تجاوز عرضك — " + auctionTitle;
        String body = buildOutbidHtml(username, auctionTitle, newAmount);
        sendHtml(toEmail, subject, body);
    }

    @Async
    public void sendWonBidEmail(String toEmail, String username, String auctionTitle, double winningAmount) {
        String subject = "You won the auction | فزت بالمزاد — " + auctionTitle;
        String body = buildWonHtml(username, auctionTitle, winningAmount);
        sendHtml(toEmail, subject, body);
    }

    @Async
    public void sendOtpEmail(String toEmail, String username, String otp) {
        String subject = "Mazadat Verification Code | رمز التحقق من مزادات";
        String body = buildOtpHtml(username, otp);
        sendHtml(toEmail, subject, body);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private void sendHtml(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─── Email templates ──────────────────────────────────────────────────────

    private String buildOutbidHtml(String username, String auctionTitle, double newAmount) {
        String amountFormatted = String.format("%.2f", newAmount);
        return wrap(
            // Arabic section (RTL)
            section("rtl",
                tag("h2", "style=\"color:#1A2E2C;margin:0 0 8px;font-size:18px\"", "تم تجاوز عرضك"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 6px\"", "مرحباً " + username + "،"),
                tag("p", "style=\"color:#444;font-size:14px;line-height:1.7;margin:0 0 10px\"",
                    "للأسف، تم تجاوز عرضك في مزاد " + strong("\"" + auctionTitle + "\"") + ". " +
                    "أعلى سعر الآن هو " + strong(amountFormatted + " ريال سعودي") + "."),
                tag("p", "style=\"color:#6B9E99;font-size:12px;margin:0\"",
                    "لا تستسلم! سجّل الدخول وقدّم عرضاً جديداً قبل انتهاء المزاد.")
            ),
            divider(),
            // English section (LTR)
            section("ltr",
                tag("h2", "style=\"color:#1A2E2C;margin:0 0 8px;font-size:18px\"", "You've Been Outbid"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 6px\"", "Hello " + username + ","),
                tag("p", "style=\"color:#444;font-size:14px;line-height:1.7;margin:0 0 10px\"",
                    "Someone placed a higher bid on " + strong("\"" + auctionTitle + "\"") + ". " +
                    "The new highest bid is " + strong("SAR " + amountFormatted) + "."),
                tag("p", "style=\"color:#6B9E99;font-size:12px;margin:0\"",
                    "Don't give up — log in and place a new bid before the auction ends!")
            )
        );
    }

    private String buildWonHtml(String username, String auctionTitle, double winningAmount) {
        String amountFormatted = String.format("%.2f", winningAmount);
        return wrap(
            // Arabic section (RTL)
            section("rtl",
                tag("h2", "style=\"color:#1A7A6E;margin:0 0 8px;font-size:18px\"", "&#127942; تهانينا! فزت بالمزاد"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 6px\"", "مبروك " + username + "!"),
                tag("p", "style=\"color:#444;font-size:14px;line-height:1.7;margin:0 0 10px\"",
                    "أنت الفائز في مزاد " + strong("\"" + auctionTitle + "\"") +
                    " بسعر " + strong(amountFormatted + " ريال سعودي") + "."),
                tag("p", "style=\"color:#6B9E99;font-size:12px;margin:0\"",
                    "يرجى تسجيل الدخول إلى مزادات لإتمام عملية الشراء وتنزيل الإيصال.")
            ),
            divider(),
            // English section (LTR)
            section("ltr",
                tag("h2", "style=\"color:#1A7A6E;margin:0 0 8px;font-size:18px\"", "&#127942; Congratulations! You Won!"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 6px\"", "Congratulations, " + username + "!"),
                tag("p", "style=\"color:#444;font-size:14px;line-height:1.7;margin:0 0 10px\"",
                    "You are the winning bidder for " + strong("\"" + auctionTitle + "\"") +
                    " with a final bid of " + strong("SAR " + amountFormatted) + "."),
                tag("p", "style=\"color:#6B9E99;font-size:12px;margin:0\"",
                    "Please log in to Mazadat to complete your purchase and download your receipt.")
            )
        );
    }

    private String buildOtpHtml(String username, String otp) {
        return wrap(
            // Arabic section (RTL)
            section("rtl",
                tag("h2", "style=\"color:#1A2E2C;margin:0 0 8px;font-size:18px;text-align:center\"", "رمز التحقق"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 20px;text-align:center\"",
                    "مرحباً " + username + "، استخدم الرمز أدناه للتحقق من هويتك.")
            ),
            // OTP code — shown ONCE, centred between the two language sections
            "<div style=\"text-align:center;padding:20px 0\">" +
            "<div style=\"display:inline-block;background:#EAF7F5;border:2px dashed #2A9D8F;border-radius:12px;padding:16px 40px\">" +
            "<span style=\"font-size:38px;font-weight:700;color:#1A7A6E;letter-spacing:12px;font-family:monospace\">" + otp + "</span>" +
            "</div>" +
            "<p style=\"color:#6B9E99;font-size:12px;margin:10px 0 0\">" +
            "&#9203; Valid for <strong>10 minutes</strong> &nbsp;|&nbsp; صالح لمدة <strong>١٠ دقائق</strong>" +
            "</p></div>",
            divider(),
            // English section (LTR)
            section("ltr",
                tag("h2", "style=\"color:#1A2E2C;margin:0 0 8px;font-size:18px;text-align:center\"", "Verification Code"),
                tag("p", "style=\"color:#1A2E2C;font-size:14px;margin:0 0 4px;text-align:center\"",
                    "Hello " + username + ", use the code above to verify your identity."),
                tag("p", "style=\"color:#E05252;font-size:12px;text-align:center;margin:0\"",
                    "Do not share this code with anyone.")
            )
        );
    }

    // ─── HTML building utilities ──────────────────────────────────────────────

    private String wrap(String... parts) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>")
          .append("<body style=\"font-family:Arial,sans-serif;background:#f4fafa;margin:0;padding:20px\">")
          .append("<div style=\"max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #C5E0DC\">")
          // Header
          .append("<div style=\"background:#1A7A6E;padding:22px 32px;text-align:center\">")
          .append("<span style=\"color:#fff;font-size:24px;font-weight:700\">Mazadat &#128200;</span>")
          .append("<span style=\"color:rgba(255,255,255,0.8);font-size:14px;margin-right:8px\"> | مزادات</span>")
          .append("</div>")
          // Body parts
          .append("<div style=\"padding:28px 32px\">");
        for (String part : parts) {
            sb.append(part);
        }
        sb.append("</div>")
          // Footer
          .append("<div style=\"background:#EAF7F5;padding:14px 32px;text-align:center;font-size:11px;color:#6B9E99\">")
          .append("admin@mazadat.org &nbsp;|&nbsp; مزادات &mdash; Mazadat")
          .append("</div></div></body></html>");
        return sb.toString();
    }

    private String section(String dir, String... children) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div dir=\"").append(dir).append("\" style=\"padding:4px 0\">");
        for (String child : children) {
            sb.append(child);
        }
        sb.append("</div>");
        return sb.toString();
    }

    private String divider() {
        return "<hr style=\"border:none;border-top:1px dashed #C5E0DC;margin:20px 0\">";
    }

    private String tag(String tagName, String style, String content) {
        return "<" + tagName + " " + style + ">" + content + "</" + tagName + ">";
    }

    private String strong(String text) {
        return "<strong>" + text + "</strong>";
    }
}
