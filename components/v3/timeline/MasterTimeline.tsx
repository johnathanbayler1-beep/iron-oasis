"use client";

import { useLayoutEffect, useRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENE_REGISTRY } from "../scenes/registry";
import Scene0Loading from "../scenes/Scene0Loading";
import Scene1LogoReveal from "../scenes/Scene1LogoReveal";
import SceneHook from "../scenes/SceneHook";
import Scene2GymReveal from "../scenes/Scene2GymReveal";
import Scene3PrivateExperience from "../scenes/Scene3PrivateExperience";
import Scene4HowItWorks from "../scenes/Scene4HowItWorks";
import Scene5AppExperience from "../scenes/Scene5AppExperience";
import Scene6LocationTrust from "../scenes/Scene6LocationTrust";
import Scene7FinalAccess from "../scenes/Scene7FinalAccess";
import GymBackdrop, { type GymBackdropHandle } from "../scenes/GymBackdrop";
import SharedGymCanvas from "../scenes/SharedGymCanvas";
import { GymSceneProvider } from "../scenes/GymSceneContext";
import { mapGlobalProgress } from "./progressMapper";
import type { SceneHandle } from "../types";
import { CameraProvider } from "../camera/CameraProvider";
import AnnotationLayer from "../annotations/AnnotationLayer";

gsap.registerPlugin(ScrollTrigger);

// Total scroll length of the V3 experience, in viewport heights. Each scene's
// share of this is set by its weight in SCENE_REGISTRY, not by DOM height —
// scenes render as fixed-position layers, this track only drives scroll.
const TOTAL_VH = 400;

const SCENE_COMPONENTS: Record<string, ForwardRefExoticComponent<RefAttributes<SceneHandle>>> = {
  loading: Scene0Loading,
  "logo-reveal": Scene1LogoReveal,
  hook: SceneHook,
  "gym-reveal": Scene2GymReveal,
  "private-experience": Scene3PrivateExperience,
  "how-it-works": Scene4HowItWorks,
  "app-experience": Scene5AppExperience,
  "location-trust": Scene6LocationTrust,
  "final-access": Scene7FinalAccess,
};

// Master timeline controller: owns the single scroll-driven progress value
// and fans it out to every registered scene's enter/update/exit lifecycle.
export default function MasterTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sceneHandles = useRef<Record<string, SceneHandle | null>>({});
  const activeSceneIds = useRef<Set<string>>(new Set());
  const backdropRef = useRef<GymBackdropHandle | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        backdropRef.current?.update(self.progress);
        const mapped = mapGlobalProgress(self.progress, SCENE_REGISTRY);
        for (const { id, active, progress } of mapped) {
          const handle = sceneHandles.current[id];
          if (!handle) continue;
          const wasActive = activeSceneIds.current.has(id);

          if (active && !wasActive) {
            handle.enter();
            activeSceneIds.current.add(id);
          }
          if (active) {
            handle.update(progress);
          }
          if (!active && wasActive) {
            handle.exit();
            activeSceneIds.current.delete(id);
          }
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <CameraProvider>
      <GymSceneProvider>
      <div ref={trackRef} className="relative" style={{ height: `${TOTAL_VH}vh` }}>
        <SharedGymCanvas />
        <GymBackdrop ref={backdropRef} />
        {SCENE_REGISTRY.map((scene) => {
          const SceneComponent = SCENE_COMPONENTS[scene.id];
          if (!SceneComponent) return null;
          return (
            <SceneComponent
              key={scene.id}
              ref={(handle) => {
                sceneHandles.current[scene.id] = handle;
              }}
            />
          );
        })}
        <AnnotationLayer annotations={[]} activeSceneId={null} sceneProgress={0} />
      </div>
      </GymSceneProvider>
    </CameraProvider>
  );
}
