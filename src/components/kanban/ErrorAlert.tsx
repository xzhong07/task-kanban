import { CircleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

type ErrorAlertProps = {
  message: string;
};

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
