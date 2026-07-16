"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroMediaProps {
  avatar?: string;
  coverImage?: string;
  creatorName: string;
}

export function HeroMedia({
  avatar,
  coverImage,
  creatorName,
}: HeroMediaProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const initial = creatorName.trim().charAt(0).toLocaleUpperCase("vi-VN") || "Q";

  return (
    <div className="hero-media" aria-label={`Ảnh giới thiệu ${creatorName}`}>
      <div className="hero-cover">
        {coverImage && !coverFailed ? (
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : null}
        <div className="hero-cover-overlay" />
      </div>

      <div className="hero-avatar" aria-label={`Ảnh đại diện của ${creatorName}`}>
        <span aria-hidden="true">{initial}</span>
        {avatar && !avatarFailed ? (
          <Image
            src={avatar}
            alt={`Ảnh đại diện của ${creatorName}`}
            fill
            priority
            sizes="144px"
            className="object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : null}
      </div>

      <div className="hero-floating-card hero-floating-card-top" aria-hidden="true">
        <span className="hero-live-dot" /> Nội dung mới mỗi tuần
      </div>
      <div className="hero-floating-card hero-floating-card-bottom" aria-hidden="true">
        TikTok · YouTube · Blog
      </div>
    </div>
  );
}
