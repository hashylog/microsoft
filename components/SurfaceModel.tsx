"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

/** Estado do modelo, animado pela timeline da cena. Ângulos em graus. */
export type SurfacePose = {
  lid: number; // tela: 180 fechada sobre o teclado, 75 em modo laptop
  stand: number; // suporte traseiro: 2 rente às costas, 40 aberto
  keyboard: number; // 0 encaixado, 1 totalmente solto (desliza para fora)
  spin: number; // giro do aparelho em torno do eixo vertical
  focus: number; // 0 enquadra o conjunto, 1 enquadra só o tablet (sem teclado)
  camAz: number; // câmera: azimute, elevação e distância relativa
  camEl: number;
  camDist: number;
};

export const SURFACE_POSE_CLOSED: SurfacePose = {
  lid: 180,
  stand: 2,
  keyboard: 0,
  spin: 0,
  focus: 0,
  camAz: 35,
  camEl: 55,
  camDist: 1.12,
};

export type SurfaceModelHandle = {
  /** Pede um novo quadro; chamado pela cena a cada atualização do scroll. */
  invalidate: () => void;
};

type Props = {
  pose: SurfacePose;
  ref?: Ref<SurfaceModelHandle>;
  className?: string;
};

const MODEL_URL = "/models/surface.glb";

/**
 * Surface RT em 3D (three.js). Carrega a biblioteca e o modelo só quando a
 * seção se aproxima da tela e desenha apenas quando a pose muda.
 */
export function SurfaceModel({ pose, ref, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const renderFrame = useRef<(() => void) | null>(null);
  const raf = useRef(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useImperativeHandle(ref, () => ({
    invalidate() {
      if (!raf.current && renderFrame.current) {
        raf.current = requestAnimationFrame(() => {
          raf.current = 0;
          renderFrame.current?.();
        });
      }
    },
  }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      setStatus("loading");
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const { MeshoptDecoder } = await import("three/addons/libs/meshopt_decoder.module.js");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.append(renderer.domElement);
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      // Gira a luz ambiente para o reflexo forte não cair de frente na tela.
      scene.environmentRotation.set(0, Math.PI * 0.75, 0);
      const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 50);

      const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL_URL);
      if (disposed) return;
      const model = gltf.scene;
      const tablet = model.getObjectByName("Frame_5_5");
      const stand = model.getObjectByName("Plane_2");
      const keyboard = model.getObjectByName("Frame_5001_189");
      if (!tablet || !stand || !keyboard) throw new Error("Peças do modelo não encontradas");
      const keyboardHome = keyboard.position.clone();

      // Filtragem anisotrópica: a tela vista em ângulo fica nítida em vez de borrada.
      const anisotropy = renderer.capabilities.getMaxAnisotropy();
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        for (const m of [o.material].flat()) {
          for (const v of Object.values(m)) {
            if (v instanceof THREE.Texture) {
              v.anisotropy = anisotropy;
              v.needsUpdate = true;
            }
          }
        }
      });

      // O giro acontece em torno do tablet, não do conjunto com o teclado.
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3()).length();
      const pivotZ = tablet.getWorldPosition(new THREE.Vector3()).z;
      const spin = new THREE.Group();
      spin.position.set(0, 0, pivotZ);
      model.position.set(0, 0, -pivotZ);
      spin.add(model);
      scene.add(spin);
      const centerZ = (bounds.min.z + bounds.max.z) / 2;
      const target = new THREE.Vector3(0, (bounds.min.y + bounds.max.y) * 0.42, centerZ);

      // Inclinação suave seguindo o mouse (valores de -1 a 1, suavizados por quadro).
      const hover = { x: 0, y: 0, tx: 0, ty: 0 };
      const allowHover = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let hoverRaf = 0;

      const deg = THREE.MathUtils.degToRad;
      const draw = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        // Renderiza acima da resolução da tela (supersampling) para suavizar as
        // bordas finas das teclas; no mobile limita a 2x para poupar a GPU.
        const dpr = w < 768 ? Math.min(window.devicePixelRatio, 2) : 2;
        if (renderer.getPixelRatio() !== dpr) renderer.setPixelRatio(dpr);
        const canvas = renderer.domElement;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }

        tablet.rotation.x = deg(pose.lid);
        stand.rotation.x = deg(pose.stand);
        // O teclado desliza para frente e para baixo, saindo do quadro.
        keyboard.position.set(keyboardHome.x, keyboardHome.y - pose.keyboard * 2.5, keyboardHome.z + pose.keyboard * 9);
        // Solto por completo, some de cena (senão reaparece quando o aparelho gira).
        keyboard.visible = pose.keyboard < 0.98;
        spin.rotation.y = deg(pose.spin + hover.x * 10);
        spin.rotation.x = deg(hover.y * 5);

        // Telas estreitas afastam a câmera para o aparelho caber na largura.
        const fit = Math.max(1, 1.25 / camera.aspect);
        target.z = THREE.MathUtils.lerp(centerZ, pivotZ, pose.focus);
        // Distância base da câmera: aumentar deixa o aparelho menor na tela.
        const r = size * 1.85 * pose.camDist * fit;
        const az = deg(pose.camAz);
        const elv = deg(pose.camEl);
        camera.position.set(
          target.x + r * Math.cos(elv) * Math.sin(az),
          target.y + r * Math.sin(elv),
          target.z + r * Math.cos(elv) * Math.cos(az),
        );
        camera.lookAt(target);
        renderer.render(scene, camera);
      };

      const hoverTick = () => {
        hover.x += (hover.tx - hover.x) * 0.08;
        hover.y += (hover.ty - hover.y) * 0.08;
        draw();
        const moving = Math.abs(hover.tx - hover.x) + Math.abs(hover.ty - hover.y) > 0.001;
        hoverRaf = moving ? requestAnimationFrame(hoverTick) : 0;
      };
      const kickHover = () => {
        if (!hoverRaf) hoverRaf = requestAnimationFrame(hoverTick);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || !allowHover) return;
        const r = el.getBoundingClientRect();
        hover.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        hover.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        kickHover();
      };
      const onPointerLeave = () => {
        hover.tx = 0;
        hover.ty = 0;
        kickHover();
      };
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);

      renderFrame.current = draw;
      const resize = new ResizeObserver(() => draw());
      resize.observe(el);
      draw();
      setStatus("ready");

      cleanup = () => {
        resize.disconnect();
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerleave", onPointerLeave);
        cancelAnimationFrame(hoverRaf);
        renderFrame.current = null;
        cancelAnimationFrame(raf.current);
        raf.current = 0;
        scene.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          o.geometry.dispose();
          for (const m of [o.material].flat()) {
            for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
            m.dispose();
          }
        });
        scene.environment?.dispose();
        pmrem.dispose();
        envScene.dispose?.();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Só baixa o three.js e o modelo quando a seção está a ~2 telas de distância.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        start().catch(() => !disposed && setStatus("error"));
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);

    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, [pose]);

  return (
    <div ref={host} className={`relative ${className}`} role="img" aria-label="Modelo 3D do Surface RT com capa-teclado e suporte traseiro">
      {status !== "ready" && (
        <p className="absolute inset-0 grid place-items-center text-sm text-[var(--mute)]">
          {status === "error" ? "Não foi possível carregar o modelo 3D." : "Carregando modelo 3D"}
        </p>
      )}
    </div>
  );
}
