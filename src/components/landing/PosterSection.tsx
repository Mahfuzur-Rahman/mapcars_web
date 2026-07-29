"use client";

import { useEffect, useState } from "react";
import { posterImageUrl, posters as postersApi, type PosterResponse } from "@/lib/api";

const ROTATE_INTERVAL_MS = 5000;

export interface PosterItem {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

const FALLBACK_POSTERS: PosterItem[] = [
  {
    id: "demo-1",
    title: "10% Off Your First 5 Rides",
    subtitle: "Welcome to MapCars! Use promo code MAPWELCOME at checkout.",
    imageUrl: "/assets/images/hero-car-branded-1.png",
  },
  {
    id: "demo-2",
    title: "Zero Surge Pricing Guarantee",
    subtitle: "Fair, transparent rates across Chichester, Portsmouth & Southampton.",
    imageUrl: "/assets/images/hero-car-branded-2.png",
  },
  {
    id: "demo-3",
    title: "Earn Up to 88% Per Trip as a Driver",
    subtitle: "Join the South Coast's fastest-growing driver community today.",
    imageUrl: "/assets/images/hero-car-branded-3.png",
  },
];

function getCardState(index: number, activeIndex: number, total: number): {
  className: string;
  role: "center" | "right" | "left" | "hidden";
} {
  if (total === 0) return { className: "poster-3d-hidden", role: "hidden" };
  const diff = (index - activeIndex + total) % total;

  if (diff === 0) {
    return { className: "poster-3d-card poster-3d-center", role: "center" };
  }
  if (diff === 1) {
    return { className: "poster-3d-card poster-3d-right", role: "right" };
  }
  if (diff === total - 1) {
    return { className: "poster-3d-card poster-3d-left", role: "left" };
  }
  return { className: "poster-3d-card poster-3d-hidden", role: "hidden" };
}

export default function PosterSection() {
  const [items, setItems] = useState<PosterItem[]>(FALLBACK_POSTERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<PosterItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    postersApi
      .listActive()
      .then((data) => {
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(FALLBACK_POSTERS);
        }
      })
      .catch(() => setItems(FALLBACK_POSTERS));
  }, []);

  const total = items.length;
  const isCarousel = total > 1;

  useEffect(() => {
    if (!isCarousel || activeModal || isHovered) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isCarousel, items, activeModal, isHovered]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveModal(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, total]);

  const handlePrev = () => {
    if (total === 0) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  };

  const handleNext = () => {
    if (total === 0) return;
    setActiveIndex((i) => (i + 1) % total);
  };

  if (total === 0) return null;

  const getImageSrc = (poster: PosterItem) =>
    poster.imageUrl || posterImageUrl(poster.id);

  return (
    <section className="poster-section" id="posters">
      <div className="section-header" style={{ marginBottom: "28px" }}>
        <span className="section-tag">Promotions &amp; Offers</span>
        <h2 className="section-title">
          Featured <span className="gradient-text">Highlights</span>
        </h2>
      </div>

      <div
        className="poster-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isCarousel && (
          <>
            <button
              className="poster-arrow poster-arrow-left"
              onClick={handlePrev}
              aria-label="Previous poster"
            >
              ‹
            </button>
            <button
              className="poster-arrow poster-arrow-right"
              onClick={handleNext}
              aria-label="Next poster"
            >
              ›
            </button>
          </>
        )}

        <div className="poster-stage">
          {items.map((poster, index) => {
            const state = getCardState(index, activeIndex, total);
            return (
              <PosterCard3D
                key={poster.id}
                poster={poster}
                cardClass={state.className}
                role={state.role}
                imageSrc={getImageSrc(poster)}
                onClick={() => {
                  if (state.role === "center") {
                    setActiveModal(poster);
                  } else {
                    setActiveIndex(index);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      {activeModal && (
        <div className="poster-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="poster-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="poster-modal-close"
              onClick={() => setActiveModal(null)}
              aria-label="Close poster view"
            >
              ✕
            </button>
            <div className="poster-modal-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageSrc(activeModal)}
                alt={activeModal.title || "Poster"}
                className="poster-modal-img"
              />
            </div>
            {(activeModal.title || activeModal.subtitle) && (
              <div className="poster-modal-caption">
                {activeModal.title && <h3 className="poster-modal-title">{activeModal.title}</h3>}
                {activeModal.subtitle && (
                  <p className="poster-modal-subtitle">{activeModal.subtitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function PosterCard3D({
  poster,
  cardClass,
  role,
  imageSrc,
  onClick,
}: {
  poster: PosterItem;
  cardClass: string;
  role: "center" | "right" | "left" | "hidden";
  imageSrc: string;
  onClick: () => void;
}) {
  const hasCopy = Boolean(poster.title || poster.subtitle);

  return (
    <div
      className={cardClass}
      onClick={onClick}
      role="button"
      tabIndex={role === "hidden" ? -1 : 0}
      aria-hidden={role === "hidden"}
    >
      <div
        className="poster-card-img"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />
      {hasCopy && (
        <>
          <div className="poster-card-overlay" />
          <div className="poster-card-body">
            {poster.title && <h3 className="poster-card-title">{poster.title}</h3>}
            {poster.subtitle && <p className="poster-card-subtitle">{poster.subtitle}</p>}
          </div>
        </>
      )}
    </div>
  );
}



