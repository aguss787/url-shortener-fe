import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { ReactNode } from "react";

export function EditModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose || (() => {})}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-gray-500 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              {children}
            </DialogPanel>
          </div>
        </div>
      </DialogBackdrop>
    </Dialog>
  );
}

export function ConfirmationModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose || (() => {})}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-gray-500 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              {children}
            </DialogPanel>
          </div>
        </div>
      </DialogBackdrop>
    </Dialog>
  );
}
