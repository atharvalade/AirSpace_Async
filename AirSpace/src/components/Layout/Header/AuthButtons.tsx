"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import NilAuthButton from "@/components/Auth/NilAuthButton";

interface AuthButtonsProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const AuthButtons = ({ onSignInClick, onSignUpClick }: AuthButtonsProps) => {
  return (
    <div className="flex items-center gap-4">
      <NilAuthButton />
    </div>
  );
};

export default AuthButtons; 