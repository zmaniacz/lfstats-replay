import React from "react";
import { EuiLoadingSpinner } from "@elastic/eui";

export function LoadError() {
  return <div>error</div>;
}

export function LoadSpinner() {
  return <EuiLoadingSpinner size="xl" />;
}
