import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  CreditCard,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { getAuctionById } from "@/services/auctionService";
import { resolveImageUrl } from "@/services/imageService";
import ImageWithRetry from "@/components/ui/ImageWithRetry";
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
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const { auctionId } = useParams();
  const isAr = i18n.language === "ar";
  const now = useNow(60_000);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      try {
        const response = await getAuctionById(auctionId);
        setAuction(response);
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
      fetchAuction();
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

  const handlePayNow = () => {
    toast.info(
      isAr
        ? "سيتم ربط الدفع في الخطوة التالية"
        : "Payment wiring will be added in the next step",
    );
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
    <div
      className="min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#F6FBFA] to-[#EAF7F5] py-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-6xl px-4">
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

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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

          <aside className="space-y-4">
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

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[#F4FAFA] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1A2E2C]">
                    <ShieldCheck className="h-4 w-4 text-[#2A9D8F]" />
                    {isAr ? "الدفع الآمن" : "Secure payment"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4F5D5B]">
                    {isAr
                      ? "سيتم ربط زر الدفع بخطوة المعالجة الفعلية في المرحلة التالية."
                      : "The payment button will be connected to the real processing flow in the next step."}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-[#4F5D5B]">
                  <div className="flex items-center justify-between rounded-2xl border border-[#C5E0DC] px-4 py-3">
                    <span>{isAr ? "الحالة" : "Status"}</span>
                    <span
                      className={`font-bold ${auctionEnded ? "text-[#E05252]" : "text-[#2A9D8F]"}`}
                    >
                      {auctionEnded
                        ? isAr
                          ? "انتهى المزاد"
                          : "Auction ended"
                        : isAr
                          ? "قيد السداد"
                          : "Awaiting payment"}
                    </span>
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

                <button
                  onClick={handlePayNow}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#1A7A6E] px-5 py-4 text-base font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:from-[#1A7A6E] hover:to-[#0D5A52]"
                >
                  <CreditCard className="h-5 w-5" />
                  {isAr ? "ادفع الآن" : "Pay Now"}
                </button>

                <button
                  onClick={() => navigate(`/auction/${auctionId}`)}
                  className="w-full rounded-2xl border border-[#C5E0DC] bg-white px-5 py-4 text-base font-bold text-[#2A9D8F] transition-colors hover:bg-[#F4FAFA]"
                >
                  {isAr ? "العودة إلى المزاد" : "Back to Auction"}
                </button>
              </div>
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
                  <dd className="font-bold text-[#2A9D8F]">
                    {isAr ? "بانتظار الدفع" : "Awaiting payment"}
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
