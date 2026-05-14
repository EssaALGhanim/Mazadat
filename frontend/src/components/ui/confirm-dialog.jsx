import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  confirmClassName = 'bg-[#E05252] text-white hover:bg-[#C73F3F]'
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        dir="ltr"
        className="overflow-hidden border-[#D7E8E5] bg-[#FCFEFD] p-0 text-[#1A2E2C] shadow-[0_24px_70px_rgba(26,46,44,0.18)] sm:max-w-md"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#2A9D8F] via-[#7DB3AD] to-[#E05252]" />
        <div className="space-y-4 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A2E2C]">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#5F7D79]">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#C5E0DC] text-[#5F7D79] hover:bg-[#F4FAFA] hover:text-[#1A2E2C]">
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction className={confirmClassName} onClick={onConfirm}>
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
