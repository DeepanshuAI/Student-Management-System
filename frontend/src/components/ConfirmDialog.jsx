import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg pointer-events-auto text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight">{title || 'Confirm Action'}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-2">
                <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
                  Confirm Delete
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
