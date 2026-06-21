export interface AuthActionState {
  status: "idle" | "error" | "success";
  message: string;
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

export interface OtpActionState {
  status: "idle" | "error";
  message: string;
}

export const initialOtpActionState: OtpActionState = {
  status: "idle",
  message: "",
};

export interface ResendOtpActionResult {
  status: "success" | "error";
  message: string;
  cooldownSeconds: number;
}
