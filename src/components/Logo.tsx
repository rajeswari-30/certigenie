import { Award } from "lucide-react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image - Replace src with your actual logo image */}
      <div
        className={`relative ${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}
      >
        <Award className="text-white" />
        <Image
          src="/logo.png" // Replace with your logo image path
          alt="CertiGenie Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={`font-bold text-slate-900 dark:text-neutral-100 ${
            size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
          }`}
        >
          CertiGenie
        </span>
        <span
          className={`text-slate-600 dark:text-neutral-400 ${
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          }`}
        >
          AI-Powered Certificate Generator
        </span>
      </div>
    </div>
  );
}
