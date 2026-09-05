import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HeartButton } from "./HeartButton";
import { outfits, type DatePlan } from "@/lib/date-plan";

const looks = (
  [
    {
      value: "blue",
      description: "A linen shirt, a floral top & ivory trousers.",
      alt: "Blue couple outfits with a linen shirt, floral blouse and ivory trousers, plus Him and Her clothing boards",
    },
    {
      value: "sage",
      description: "A sage kurta & linen shirt. Sweetly in sync.",
      alt: "Couple in a sage floral kurta and sage linen shirt, with Him and Her clothing boards",
    },
    {
      value: "rose",
      description: "A rosy dress & a matching shirt for dinner.",
      alt: "Couple in a dusty rose dress and matching shirt with charcoal trousers, plus Him and Her clothing boards",
    },
  ] as const
).map((look) => ({
  ...look,
  title: outfits.find((outfit) => outfit.value === look.value)!.label,
  image: `/images/outfits/${look.value}.png`,
}));

export function OutfitChooser({
  outfit,
  onOutfitChange,
  onBack,
  onNext,
}: {
  outfit: DatePlan["outfit"] | null;
  onOutfitChange: (value: DatePlan["outfit"]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const initialIndex = Math.max(
    0,
    looks.findIndex((look) => look.value === outfit),
  );
  const [index, setIndex] = useState(initialIndex);
  const [carouselRef, api] = useEmblaCarousel({ loop: true, startIndex: initialIndex });
  const current = looks[index] ?? looks[0]!;

  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        A little twinning, a little romance. Swipe to pick our look. 💕
      </p>
      <section
        aria-label="Outfit inspiration"
        aria-roledescription="carousel"
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            api?.scrollPrev();
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            api?.scrollNext();
          }
        }}
      >
        <div
          ref={carouselRef}
          className="overflow-hidden rounded-lg border border-primary/10 bg-blush"
        >
          <div className="flex touch-pan-y">
            {looks.map((look, slideIndex) => (
              <div
                key={look.value}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${looks.length}: ${look.title}`}
                aria-hidden={slideIndex !== index}
                className="relative min-w-0 flex-[0_0_100%]"
              >
                <img
                  src={look.image}
                  alt={look.alt}
                  width={1122}
                  height={1402}
                  draggable={false}
                  className="h-[min(44dvh,390px)] w-full object-contain"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="Previous outfit"
          onClick={() => api?.scrollPrev()}
          className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next outfit"
          onClick={() => api?.scrollNext()}
          className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </section>
      <div className="text-center" aria-live="polite" aria-atomic="true">
        <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
          Look {index + 1} of {looks.length}
        </p>
        <h3 className="mt-1 text-2xl font-semibold">{current.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{current.description}</p>
      </div>
      <div className="flex justify-center gap-1">
        {looks.map((look, dotIndex) => (
          <button
            key={look.value}
            type="button"
            aria-label={`Show ${look.title}`}
            aria-pressed={index === dotIndex}
            onClick={() => api?.scrollTo(dotIndex)}
            className="flex h-8 w-10 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span
              className={`h-1.5 rounded-full transition-all ${index === dotIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/25"}`}
            />
          </button>
        ))}
      </div>
      <HeartButton
        onClick={() => {
          onOutfitChange(current.value);
          onNext();
        }}
      >
        Let&apos;s wear this ❤️
      </HeartButton>
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 px-1 text-xs font-semibold text-muted-foreground"
        >
          Back to date idea
        </button>
      </div>
    </div>
  );
}
