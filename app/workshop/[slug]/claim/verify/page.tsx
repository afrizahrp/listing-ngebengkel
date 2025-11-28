'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useVerifyClaim } from '@/queryHooks/useVerifyClaim';
import { useResendOtp } from '@/queryHooks/useResendOtp';
import { useWaitingList } from '@/queryHooks/useWaitingList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ClaimVerifyPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugOrId = params?.slug ?? '';
  const claimRequestId = searchParams.get('claimRequestId') || '';

  const [otp, setOtp] = useState('');
  // Durasi OTP dari environment variable (default: 300 detik = 5 menit)
  const OTP_EXPIRY_SECONDS = parseInt(
    process.env.NEXT_PUBLIC_OTP_EXPIRY_SECONDS || '300',
    10,
  );
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const { data: workshop } = useWaitingList(slugOrId, {
    enabled: Boolean(slugOrId),
  });

  const verifyMutation = useVerifyClaim();
  const resendMutation = useResendOtp();

  const waitingListId = workshop?.id?.trim();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerify = async () => {
    if (!waitingListId || !claimRequestId) {
      toast.error('Error', {
        description: 'Data tidak lengkap. Silakan coba lagi.',
      });
      return;
    }

    if (otp.length !== 6) {
      toast.error('Kode OTP tidak valid', {
        description: 'Masukkan 6 digit kode OTP.',
      });
      return;
    }

    try {
      const result = await verifyMutation.mutateAsync({
        waitingListId,
        claimRequestId,
        verificationCode: otp,
      });

      toast.success('Verifikasi Berhasil!', {
        description: result.message,
      });

      // Redirect ke halaman detail workshop setelah 1.5 detik
      setTimeout(() => {
        router.push(`/workshop/${slugOrId}`);
      }, 1500);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal memverifikasi kode OTP.';
      toast.error('Verifikasi Gagal', {
        description: message,
      });
    }
  };

  const handleResend = async () => {
    if (!waitingListId || !claimRequestId) {
      toast.error('Error', {
        description: 'Data tidak lengkap. Silakan coba lagi.',
      });
      return;
    }

    try {
      await resendMutation.mutateAsync({
        waitingListId,
        claimRequestId,
      });

      toast.success('Kode Baru Dikirim', {
        description: 'Kode verifikasi baru telah dikirim ke WhatsApp Anda.',
      });

      // Reset timer
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setIsExpired(false);
      setOtp('');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim ulang kode OTP.';
      toast.error('Gagal Mengirim Ulang', {
        description: message,
      });
    }
  };

  if (!claimRequestId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Request klaim tidak ditemukan. Silakan kembali dan coba lagi.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Verifikasi Klaim Bengkel</CardTitle>
              <CardDescription>
                {workshop?.name || 'Bengkel'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp">Kode Verifikasi (6 digit)</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest"
              disabled={verifyMutation.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Masukkan kode 6 digit yang telah dikirim ke WhatsApp Anda
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Kode berlaku selama:
              </span>
            </div>
            <span
              className={`font-mono font-semibold ${
                isExpired ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {isExpired ? 'Expired' : formatTime(timeLeft)}
            </span>
          </div>

          {/* Verify Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleVerify}
            disabled={
              otp.length !== 6 ||
              verifyMutation.isPending ||
              isExpired ||
              !waitingListId
            }
          >
            {verifyMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verifikasi
              </>
            )}
          </Button>

          {/* Resend Button */}
          {isExpired && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Kode sudah expired. Silakan kirim ulang kode verifikasi.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resendMutation.isPending || !waitingListId}
              >
                {resendMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Kirim Ulang Kode
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Resend (jika belum expired) */}
          {!isExpired && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleResend}
              disabled={resendMutation.isPending || !waitingListId}
            >
              {resendMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kirim Ulang Kode
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

