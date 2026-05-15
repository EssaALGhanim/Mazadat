import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  CreditCard,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { getAuctionById } from "@/services/auctionService";
import { resolveImageUrl } from "@/services/imageService";
import ImageWithRetry from "@/components/ui/ImageWithRetry";
import TopNavigationBar from "@/components/TopNavigationBar";
import PaymentStatusIndicator, {
  resolvePaymentStatus,
} from "@/components/payment/PaymentStatusIndicator";
import {
  getPaymentStatus,
  submitPayment,
} from "@/services/paymentService";
import { useNow } from "@/hooks/useNow";
import {
  resolveTextAlignmentClass,
  resolveTextDirection,
} from "@/lib/textDirection";

function formatDeadline(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatTimeRemaining(targetMs, nowMs) {
  const diff = Math.max(0, targetMs - nowMs);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (hours <= 0) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export default function PaymentPage({ currentUser }) {
  const { i18n } = useTranslation("common");
  const navigate = useNavigate();
  const { auctionId } = useParams();
  const isAr = i18n.language === "ar";
  const now = useNow(60_000);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatusData, setPaymentStatusData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [amountConfirmed, setAmountConfirmed] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState("");

  const loadPaymentStatus = async () => {
    if (!auctionId) return;

    setStatusLoading(true);
    try {
      const response = await getPaymentStatus(auctionId);
      setPaymentStatusData(response);
    } catch {
      setPaymentStatusData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        const [auctionResponse, statusResponse] = await Promise.all([
          getAuctionById(auctionId),
          getPaymentStatus(auctionId).catch(() => null),
        ]);

        setAuction(auctionResponse);
        setPaymentStatusData(statusResponse);
        setError(null);
      } catch (err) {
        setError(
          err?.message ||
            (isAr ? "فشل تحميل المزاد" : "Failed to load auction"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchPaymentData();
    }
  }, [auctionId, isAr]);

  const startDate = auction?.startDate ? new Date(auction.startDate) : null;
  const endDate = auction?.endDate ? new Date(auction.endDate) : null;
  const auctionEnded =
    auction?.status === "COMPLETED" ||
    auction?.status === "ENDED" ||
    auction?.status === "FAILED_BELOW_RESERVE" ||
    (endDate ? endDate.getTime() <= now : false);
  const currentPrice = Number(auction?.currentPrice || 0);
  const startingPrice = Number(auction?.startingPrice || 0);
  const amountDue = currentPrice > 0 ? currentPrice : startingPrice;
  const winningLabel =
    auction?.highestBidder === currentUser?.username
      ? isAr
        ? "أنت الفائز في هذا المزاد"
        : "You won this auction"
      : isAr
        ? "إتمام الدفع للفائز"
        : "Payment settlement";
  const remainingMs = endDate ? endDate.getTime() + 48 * 60 * 60 * 1000 : null;
  const deadlineLabel = remainingMs ? formatDeadline(remainingMs) : "—";
  const timeRemaining = remainingMs
    ? formatTimeRemaining(remainingMs, now)
    : null;
  const isBuyer = currentUser?.role === "BUYER";
  const isSeller = currentUser?.role === "SELLER";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleShowMyBids = () => {
    navigate("/", { state: { openMyBids: true } });
  };

  const handleShowWatchlist = () => {
    navigate("/", { state: { openWatchlist: true } });
  };

  const paymentMethodOptions = [
    {
      value: "bank-transfer",
      label: isAr ? "تحويل بنكي" : "Bank transfer",
      description: isAr ? "أفضل خيار للاختبار اليدوي" : "Best for manual testing",
      icon: Landmark,
    },
    {
      value: "card",
      label: isAr ? "بطاقة ائتمان" : "Credit card",
      description: isAr ? "مناسب للربط مع مزود دفع" : "Ready for a payment provider",
      icon: CreditCard,
    },
    {
      value: "mada",
      label: isAr ? "مدى" : "Mada",
      description: isAr ? "خيار محلي مرن" : "Local card rail option",
      icon: ShieldAlert,
    },
  ];

  const bankDetails = {
    bankName: isAr ? "مصرف التجربة" : "Demo Bank",
    accountName: isAr ? "مزادات" : "Mazadat",
    iban: "SA00 0000 0000 0000 0000 0000",
    reference: auctionId,
  };

  const selectedMethod =
    paymentMethodOptions.find((item) => item.value === paymentMethod) ||
    paymentMethodOptions[0];

  const resolvedPaymentStatus = resolvePaymentStatus({
    status: paymentStatusData?.status || paymentStatusData?.paymentStatus,
    isPaid:
      typeof paymentStatusData?.isPaid === "boolean"
        ? paymentStatusData.isPaid
        : auction?.isPaid,
    paidAt: paymentStatusData?.paidAt || auction?.paidAt,
    endDate: auction?.endDate,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (resolvedPaymentStatus === "paid") {
      toast.info(
        isAr
          ? "تم تسجيل الدفع مسبقًا"
          : "Payment is already marked as paid",
      );
      return;
    }

    if (!amountConfirmed) {
      toast.error(
        isAr
          ? "يرجى تأكيد مبلغ الدفع أولاً"
          : "Please confirm the payment amount first",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitPayment(auctionId, {
        paymentMethod,
        amount: amountDue,
        referenceNumber,
      });

      if (response && typeof response === "object") {
        setPaymentStatusData(response);
      }

      await loadPaymentStatus();

      toast.success(
        isAr
          ? "تم إرسال بيانات الدفع بنجاح"
          : "Payment submitted successfully",
      );
    } catch (err) {
      toast.error(
        err?.message ||
          (isAr ? "فشل إرسال الدفع" : "Failed to submit payment"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#F6FBFA] to-[#EAF7F5] flex items-center justify-center">
        <div className="w-11 h-11 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#F6FBFA] to-[#EAF7F5] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-[#C5E0DC] bg-white p-6 shadow-lg">
          <p className="mb-4 text-center font-semibold text-[#E05252]">
            {error || (isAr ? "المزاد غير متاح" : "Auction not available")}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-xl bg-[#2A9D8F] px-4 py-3 font-bold text-white transition-colors hover:bg-[#1A7A6E]"
          >
            {isAr ? "العودة" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  const titleDir = resolveTextDirection(auction?.title || "");
  const descriptionDir = resolveTextDirection(auction?.description || "");
  const images = auction?.images || [];
  const coverImage = images[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#F6FBFA] to-[#EAF7F5]" dir={isAr ? "rtl" : "ltr"}>
      <TopNavigationBar
        currentUser={currentUser}
        isSeller={isSeller}
        isBuyer={isBuyer}
        onShowMyBids={handleShowMyBids}
        onShowWatchlist={handleShowWatchlist}
        onCreateAuction={() => {}}
        onLogout={handleLogout}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2A9D8F] transition-colors hover:text-[#1A7A6E]"
        >
          {isAr ? (
            <ArrowLeft className="h-4 w-4 rotate-180" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          {isAr ? "العودة" : "Back"}
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4 self-start">
            <section className="overflow-hidden rounded-3xl border border-[#C5E0DC] bg-white shadow-[0_18px_55px_rgba(42,157,143,0.08)]">
            <div className="relative bg-gradient-to-br from-[#F4FAFA] to-[#EAF7F5] p-6 sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2A9D8F]/10 px-3 py-1 text-sm font-semibold text-[#2A9D8F]">
                <Trophy className="h-4 w-4" />
                {winningLabel}
              </div>

              <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
                  {coverImage ? (
                    <ImageWithRetry
                      src={resolveImageUrl(
                        coverImage.url,
                        coverImage.createdAt || coverImage.id,
                      )}
                      alt={auction.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-[#F4FAFA] text-center text-sm font-semibold text-[#C5E0DC]">
                      {isAr ? "لا توجد صورة" : "No image"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B9E99]">
                    {auction?.auctionHouseName ||
                      (isAr ? "الصالة" : "Auction House")}
                  </p>
                  <h1
                    dir={titleDir}
                    className={`mt-2 text-3xl font-black text-[#1A2E2C] sm:text-4xl ${resolveTextAlignmentClass(auction?.title || "")}`}
                  >
                    {auction.title}
                  </h1>
                  <p
                    dir={descriptionDir}
                    className={`mt-3 max-w-2xl text-sm leading-7 text-[#4F5D5B] ${resolveTextAlignmentClass(auction?.description || "")}`}
                  >
                    {auction?.description}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#C5E0DC] bg-white/80 p-4">
                      <p className="text-xs font-semibold text-[#6B9E99]">
                        {isAr ? "المبلغ المستحق" : "Amount due"}
                      </p>
                      <p
                        className="mt-1 text-2xl font-black text-[#2A9D8F]"
                        dir="ltr"
                      >
                        {amountDue.toLocaleString()}{" "}
                        <span className="text-sm font-bold">﷼</span>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#C5E0DC] bg-white/80 p-4">
                      <p className="text-xs font-semibold text-[#6B9E99]">
                        {isAr ? "آخر موعد للدفع" : "Payment deadline"}
                      </p>
                      <p className="mt-1 text-base font-bold text-[#1A2E2C]">
                        {deadlineLabel}
                      </p>
                      {timeRemaining && (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#2A9D8F]">
                          <Clock3 className="h-4 w-4" />
                          {isAr
                            ? `متبقي ${timeRemaining}`
                            : `${timeRemaining} remaining`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </section>

            <section className="rounded-3xl border border-[#C5E0DC] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#6B9E99]">
                {isAr ? "ماذا يحدث بعد الدفع؟" : "What Happens After Payment"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#C5E0DC] bg-[#F8FBFB] p-4">
                  <p className="text-xs font-semibold text-[#6B9E99]">
                    {isAr ? "تأكيد الطلب" : "Confirmation"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1A2E2C]">
                    {isAr ? "سيتم تأكيد الدفع في الخطوة التالية" : "Payment is confirmed in the next step"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#C5E0DC] bg-[#F8FBFB] p-4">
                  <p className="text-xs font-semibold text-[#6B9E99]">
                    {isAr ? "الإيصال" : "Receipt"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1A2E2C]">
                    {isAr ? "يظهر زر الإيصال بعد تأكيد الدفع" : "Receipt becomes available after payment confirmation"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#C5E0DC] bg-[#F8FBFB] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold text-[#6B9E99]">
                    {isAr ? "المرجع الموصى به" : "Recommended reference"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1A2E2C]" dir="ltr">
                    #{auctionId}-{Math.round(amountDue)}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="rounded-3xl border border-[#C5E0DC] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F5] text-[#2A9D8F]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A2E2C]">
                    {isAr ? "خطوة الدفع" : "Payment step"}
                  </h2>
                  <p className="text-sm text-[#6B9E99]">
                    {isAr
                      ? "أكمل الدفع لإظهار الإيصال"
                      : "Complete payment to unlock the receipt"}
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="rounded-2xl bg-[#F4FAFA] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1A2E2C]">
                    <ShieldCheck className="h-4 w-4 text-[#2A9D8F]" />
                    {isAr ? "نموذج دفع قابل للاستبدال" : "Replaceable payment form"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4F5D5B]">
                    {isAr
                      ? "صممنا الخطوة الحالية بحيث يمكن تبديل مزود الدفع لاحقًا بدون تغيير كبير في الصفحة."
                      : "This step is structured so a future payment provider can be swapped in without changing the page layout."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#C5E0DC] bg-white p-4">
                  <label
                    htmlFor="paymentMethod"
                    className="mb-2 block text-sm font-semibold text-[#1A2E2C]"
                  >
                    {isAr ? "طريقة الدفع" : "Payment method"}
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full rounded-2xl border border-[#C5E0DC] bg-white px-4 py-3 text-sm font-medium text-[#1A2E2C] outline-none transition-colors focus:border-[#2A9D8F]"
                  >
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 rounded-2xl bg-[#F4FAFA] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1A2E2C]">
                      <selectedMethod.icon className="h-4 w-4 text-[#2A9D8F]" />
                      {selectedMethod.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4F5D5B]">
                      {selectedMethod.description}
                    </p>

                    {selectedMethod.value === "bank-transfer" ? (
                      <dl className="mt-4 grid gap-3 text-sm text-[#4F5D5B] sm:grid-cols-2">
                        <div className="rounded-xl border border-white bg-white px-3 py-2">
                          <dt className="text-xs font-semibold text-[#6B9E99]">
                            {isAr ? "اسم البنك" : "Bank name"}
                          </dt>
                          <dd className="mt-1 font-bold text-[#1A2E2C]">
                            {bankDetails.bankName}
                          </dd>
                        </div>
                        <div className="rounded-xl border border-white bg-white px-3 py-2">
                          <dt className="text-xs font-semibold text-[#6B9E99]">
                            {isAr ? "اسم الحساب" : "Account name"}
                          </dt>
                          <dd className="mt-1 font-bold text-[#1A2E2C]">
                            {bankDetails.accountName}
                          </dd>
                        </div>
                        <div className="rounded-xl border border-white bg-white px-3 py-2">
                          <dt className="text-xs font-semibold text-[#6B9E99]">
                            IBAN
                          </dt>
                          <dd className="mt-1 font-bold text-[#1A2E2C]">
                            {bankDetails.iban}
                          </dd>
                        </div>
                        <div className="rounded-xl border border-white bg-white px-3 py-2">
                          <dt className="text-xs font-semibold text-[#6B9E99]">
                            {isAr ? "المرجع" : "Reference"}
                          </dt>
                          <dd className="mt-1 font-bold text-[#1A2E2C]">
                            {bankDetails.reference}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 rounded-xl border border-white bg-white px-3 py-2 text-sm text-[#4F5D5B]">
                        {isAr
                          ? "ستتم إضافة شاشة مزود الدفع هنا لاحقًا دون تغيير بنية الصفحة الأساسية."
                          : "A future provider widget can be dropped in here without changing the rest of the page."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C5E0DC] bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1A2E2C]">
                        {isAr ? "تأكيد المبلغ" : "Confirm amount"}
                      </p>
                      <p className="mt-1 text-sm text-[#6B9E99]">
                        {isAr
                          ? "راجع المبلغ قبل المتابعة"
                          : "Review the amount before submitting"}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-[#2A9D8F]" dir="ltr">
                      {amountDue.toLocaleString()} <span className="text-sm font-bold">﷼</span>
                    </p>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C5E0DC] bg-[#F4FAFA] px-4 py-3 text-sm text-[#1A2E2C]">
                    <input
                      type="checkbox"
                      checked={amountConfirmed}
                      onChange={(event) => setAmountConfirmed(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#C5E0DC] text-[#2A9D8F] focus:ring-[#2A9D8F]"
                    />
                    <span>
                      {isAr
                        ? "أؤكد أن المبلغ أعلاه صحيح وأنني أوافق على متابعة الدفع."
                        : "I confirm the amount above is correct and I’m ready to continue."}
                    </span>
                  </label>
                </div>

                <div className="rounded-2xl border border-[#C5E0DC] bg-white p-4">
                  <label
                    htmlFor="paymentReference"
                    className="mb-2 block text-sm font-semibold text-[#1A2E2C]"
                  >
                    {isAr ? "مرجع الدفع (اختياري)" : "Payment reference (optional)"}
                  </label>
                  <input
                    id="paymentReference"
                    type="text"
                    value={referenceNumber}
                    onChange={(event) => setReferenceNumber(event.target.value)}
                    placeholder={isAr ? "مثال: إيصال البنك" : "e.g. bank receipt number"}
                    className="w-full rounded-2xl border border-[#C5E0DC] bg-white px-4 py-3 text-sm text-[#1A2E2C] outline-none transition-colors placeholder:text-[#A7BAB5] focus:border-[#2A9D8F]"
                  />
                </div>

                <div className="grid gap-3 text-sm text-[#4F5D5B]">
                  <div className="flex items-center justify-between rounded-2xl border border-[#C5E0DC] px-4 py-3">
                    <span>{isAr ? "الحالة" : "Status"}</span>
                    {statusLoading ? (
                      <span className="text-xs font-semibold text-[#6B9E99]">
                        {isAr ? "جاري التحقق..." : "Checking..."}
                      </span>
                    ) : (
                      <PaymentStatusIndicator
                        status={paymentStatusData?.status || paymentStatusData?.paymentStatus}
                        isPaid={paymentStatusData?.isPaid ?? auction?.isPaid}
                        paidAt={paymentStatusData?.paidAt || auction?.paidAt}
                        endDate={auction?.endDate}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-[#C5E0DC] px-4 py-3">
                    <span>{isAr ? "وقت الإغلاق" : "Auction end"}</span>
                    <span className="font-semibold text-[#1A2E2C]">
                      {formatDeadline(auction?.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-[#C5E0DC] px-4 py-3">
                    <span>{isAr ? "البدء" : "Start"}</span>
                    <span className="font-semibold text-[#1A2E2C]">
                      {formatDeadline(startDate)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C5E0DC] bg-[#F8FBFB] p-4">
                  <h3 className="text-sm font-bold text-[#1A2E2C]">
                    {isAr ? "الخطوات التالية" : "Next steps"}
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm text-[#4F5D5B]">
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10 text-xs font-bold text-[#2A9D8F]">1</span>
                      <span>{isAr ? "اختر طريقة الدفع المناسبة." : "Choose a payment method that can be swapped later."}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10 text-xs font-bold text-[#2A9D8F]">2</span>
                      <span>{isAr ? "أكد المبلغ وراجع المرجع." : "Confirm the amount and review the reference."}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10 text-xs font-bold text-[#2A9D8F]">3</span>
                      <span>{isAr ? "أرسل البيانات ثم نستبدل هذه الخطوة لاحقًا بمزود الدفع الحقيقي." : "Submit now, then replace this flow with the real provider later."}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={submitting || resolvedPaymentStatus === "paid"}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] px-5 py-4 text-base font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:from-[#1A7A6E] hover:to-[#0D5A52]"
                >
                  <CreditCard className="h-5 w-5" />
                  {submitting
                    ? isAr
                      ? "جاري الإرسال..."
                      : "Submitting..."
                    : resolvedPaymentStatus === "paid"
                      ? isAr
                        ? "تم الدفع"
                        : "Paid"
                      : isAr
                        ? "إرسال الدفع"
                        : "Submit payment"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/auction/${auctionId}`)}
                  className="w-full rounded-2xl border border-[#C5E0DC] bg-white px-5 py-4 text-base font-bold text-[#2A9D8F] transition-colors hover:bg-[#F4FAFA]"
                >
                  {isAr ? "العودة إلى المزاد" : "Back to Auction"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-[#C5E0DC] bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#6B9E99]">
                {isAr ? "ملخص سريع" : "Quick summary"}
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#6B9E99]">
                    {isAr ? "العرض الأعلى" : "Winning bid"}
                  </dt>
                  <dd className="font-bold text-[#1A2E2C]" dir="ltr">
                    {amountDue.toLocaleString()} ﷼
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#6B9E99]">
                    {isAr ? "الفائز" : "Winner"}
                  </dt>
                  <dd className="font-bold text-[#1A2E2C]">
                    {auction?.highestBidder || currentUser?.username || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#6B9E99]">
                    {isAr ? "الحالة الحالية" : "Current state"}
                  </dt>
                  <dd>
                    <PaymentStatusIndicator
                      status={paymentStatusData?.status || paymentStatusData?.paymentStatus}
                      isPaid={paymentStatusData?.isPaid ?? auction?.isPaid}
                      paidAt={paymentStatusData?.paidAt || auction?.paidAt}
                      endDate={auction?.endDate}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#6B9E99]">
                    {isAr ? "الطريقة" : "Method"}
                  </dt>
                  <dd className="font-bold text-[#1A2E2C] capitalize">
                    {selectedMethod.label}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#6B9E99]">
                    {isAr ? "المرجع" : "Reference"}
                  </dt>
                  <dd className="font-bold text-[#1A2E2C]" dir="ltr">
                    {referenceNumber || auctionId}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
