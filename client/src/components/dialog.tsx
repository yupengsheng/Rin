import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonWithLoading } from "./button";
import { ModalSurface } from "./public-ui";

export type Confirm = {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
}

export type Alert = {
    message: string;
    onConfirm: () => void;
}

export type ShowAlertType = (msg: string, onConfirm?: () => (Promise<void> | void)) => void;

export function useAlert() {
    const [alert, setAlert] = useState<Alert | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const close = () => {
        alert?.onConfirm()
        setIsOpen(false)
        setAlert(null)
    }
    const showAlert = (alert: string, onConfirm?: () => void) => {
        setAlert({
            message: alert,
            onConfirm: onConfirm ?? (() => { })
        })
        setIsOpen(true)
    }
    const { t } = useTranslation()
    const AlertUI = () => (
        <ModalSurface isOpen={isOpen} onRequestClose={close} className="min-w-56 sm:min-w-96">
            <div className="flex flex-col items-start space-y-4">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] t-primary">
                    {t("alert")}
                </h1>
                <p className="text-base leading-7 t-primary">
                    {alert?.message}
                </p>
                <div className="w-full flex flex-row items-center justify-center space-x-2 mt-4">
                    <Button onClick={close} title={t('confirm')} />
                </div>
            </div>
        </ModalSurface>
    )
    return { showAlert, close, AlertUI }
}

export function useConfirm() {
    const [confirm, setConfirm] = useState<Confirm | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const close = () => {
        setConfirm(null)
        setIsOpen(false)
    }
    const showConfirm = (title: string, message: string, onConfirm?: () => Promise<void> | void) => {
        setConfirm({
            title,
            message,
            onConfirm: onConfirm ?? (() => { })
        })
        setIsOpen(true)
    }
    const { t } = useTranslation()
    const ConfirmUI = () => (
        <ModalSurface isOpen={isOpen} onRequestClose={close} className="min-w-56 sm:min-w-96">
            <div className="flex flex-col items-start space-y-4">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] t-primary">
                    {confirm?.title}
                </h1>
                <p className="text-base leading-7 t-primary">
                    {confirm?.message}
                </p>
                <div className="w-full flex flex-row items-center justify-center space-x-2 mt-4">
                    <ButtonWithLoading
                        loading={loading}
                        onClick={async () => {
                            setLoading(true);
                            await confirm?.onConfirm();
                            setLoading(false);
                            setIsOpen(false);
                        }}
                        title={t('confirm')} />
                    <Button secondary onClick={close} title={t('cancel')} />
                </div>
            </div>
        </ModalSurface>
    )
    return { showConfirm, close, ConfirmUI }
}
