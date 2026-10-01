"use client";

import { ChangeEvent, ReactNode, useMemo, useState } from "react";
import { Check, ExternalLink, ImageUp, Library, Nfc, PackageCheck, Play, Plus, Save, ScanLine, Shirt, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { SegmentedControl } from "@/components/atoms/SegmentedControl";
import { StatusPill } from "@/components/atoms/StatusPill";
import { Switch } from "@/components/atoms/Switch";
import GlideMenu from "@/components/primitives/GlideMenu";

type Product = "Tee" | "Hoodie" | "Cap" | "Tote";
type MediaKind = "Video" | "Audio" | "Link";
const products: Product[] = ["Tee", "Hoodie", "Cap", "Tote"];
const mediaKinds: MediaKind[] = ["Video", "Audio", "Link"];

export default function SmartWearStudio() {
  const [product, setProduct] = useState<Product>("Tee");
  const [artUrl, setArtUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaKind>("Video");
  const [nfc, setNfc] = useState(true);
  const [visualScan, setVisualScan] = useState(true);
  const [artScale, setArtScale] = useState(72);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [published, setPublished] = useState(false);

  const activationLabel = useMemo(() => {
    if (nfc && visualScan) return "NFC + visual scan";
    if (nfc) return "NFC tap";
    if (visualScan) return "Visual scan";
    return "No activation";
  }, [nfc, visualScan]);

  function uploadArt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setArtUrl(URL.createObjectURL(file));
    setPublished(false);
  }

  function uploadMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMediaUrl(URL.createObjectURL(file));
    setMediaKind(file.type.startsWith("audio/") ? "Audio" : "Video");
    setPublished(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>smartwear</strong><span>studio</span></div>
        </div>

        <nav className="nav">
          <button className="nav-item active"><b>＋</b>Create</button>
          <button className="nav-item"><b>◫</b>Library</button>
          <button className="nav-item"><b>◇</b>Products</button>
          <button className="nav-item"><b>↗</b>Orders</button>
        </nav>

        <div className="prototype-note">
          <div><i /> Prototype mode</div>
          <p>NFC and scan flows are simulated in-browser.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span>Smartwear / New piece</span>
            <h1>Create interactive merchandise</h1>
          </div>
          <div className="top-actions">
            <Button variant="secondary" size="sm"><Save size={14} strokeWidth={1.8} aria-hidden="true" />Save draft</Button>
            <div className="avatar">AC</div>
          </div>
        </header>

        <div className="steps">
          {["Product", "Design", "Interaction", "Preview"].map((step, i) => (
            <div className={i < 3 ? "step done" : "step"} key={step}>
              <b>{i + 1}</b>{step}
            </div>
          ))}
        </div>

        <div className="studio">
          <section className="panel controls">
            <Heading number="01" title="Choose the piece" aside="Blank garment" />
            <div className="product-grid">
              {products.map((item) => (
                <button
                  key={item}
                  className={product === item ? "product selected" : "product"}
                  onClick={() => { setProduct(item); setPublished(false); }}
                >
                  <span className={"mini " + item.toLowerCase()} />
                  <strong>{item}</strong>
                </button>
              ))}
            </div>

            <Rule />
            <Heading number="02" title="Add artwork" />

            <label className="upload">
              <input type="file" accept="image/*" onChange={uploadArt} />
              <span>↑</span>
              <strong>{artUrl ? "Artwork added" : "Upload artwork"}</strong>
              <small>PNG, JPG, WEBP · used as the scan target</small>
            </label>

            <div className="slider-label"><span>Artwork scale</span><b>{artScale}%</b></div>
            <input
              className="range"
              type="range"
              min="45"
              max="100"
              value={artScale}
              onChange={(e) => setArtScale(Number(e.target.value))}
            />
          </section>

          <section className="canvas">
            <div className="canvas-bar">
              <span><i /> Live product preview</span>
              <span>{product} · Front</span>
            </div>

            <div className="stage">
              <div className={"garment garment-" + product.toLowerCase()}>
                <div className="art-zone" style={{ width: artScale + "%" }}>
                  {artUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={artUrl} alt="Uploaded artwork" />
                  ) : (
                    <div className="default-art">
                      <div className="orbit one" />
                      <div className="orbit two" />
                      <div className="monogram">SW</div>
                      <em>SCAN TO OPEN</em>
                    </div>
                  )}
                  {visualScan && <div className="scan-corners" />}
                </div>
                {nfc && <div className="nfc"><Nfc size={11} strokeWidth={1.8} aria-hidden="true" /> NFC</div>}
              </div>

              <div className="preview-meta">
                <div className="flex gap-1.5">
                  <StatusPill tone="accent">{activationLabel}</StatusPill>
                  <StatusPill tone="green">Media ready</StatusPill>
                </div>
                <p>Tap the hidden NFC tag or scan the artwork to open its media experience.</p>
              </div>
            </div>
          </section>

          <section className="panel activation">
            <Heading number="03" title="Make it interactive" />

            <Toggle
              enabled={nfc}
              icon={<Nfc size={15} strokeWidth={1.8} aria-hidden="true" />}
              title="NFC tap"
              subtitle="Phone touches the hidden tag"
              onClick={() => { setNfc(!nfc); setPublished(false); }}
            />
            <Toggle
              enabled={visualScan}
              icon={<ScanLine size={15} strokeWidth={1.8} aria-hidden="true" />}
              title="Visual scan"
              subtitle="Camera recognizes the artwork"
              onClick={() => { setVisualScan(!visualScan); setPublished(false); }}
            />

            <Rule />
            <label className="label">What opens?</label>
            <SegmentedControl
              options={mediaKinds}
              value={mediaKind}
              onChange={(kind) => { setMediaKind(kind); setPublished(false); }}
              className="w-full"
            />

            {mediaKind === "Link" ? (
              <input
                className="text-input"
                value={mediaUrl}
                onChange={(e) => { setMediaUrl(e.target.value); setPublished(false); }}
                placeholder="https://..."
              />
            ) : (
              <label className="media-upload">
                <input
                  type="file"
                  accept={mediaKind === "Audio" ? "audio/*" : "video/*"}
                  onChange={uploadMedia}
                />
                <span>▶</span>
                <div>
                  <strong>{mediaUrl ? mediaKind + " attached" : "Attach " + mediaKind.toLowerCase()}</strong>
                  <small>Local preview only in this frontend demo</small>
                </div>
              </label>
            )}

            <div className="info-card">
              <b>04</b>
              <div>
                <strong>Phone experience</strong>
                <p>Media opens immediately after recognition. The product concept requires no dedicated customer app.</p>
              </div>
            </div>

            <Button
              variant="accent"
              size="md"
              className="mt-2 w-full"
              onClick={() => setPreviewOpen(true)}
            >
              <ScanLine size={15} strokeWidth={1.8} aria-hidden="true" />
              Preview customer scan
            </Button>
            <Button
              variant={published ? "success" : "secondary"}
              size="md"
              className="mt-2 w-full"
              onClick={() => setPublished(true)}
              disabled={!nfc && !visualScan}
            >
              {published ? <><Check size={15} strokeWidth={1.8} aria-hidden="true" />Demo piece published</> : "Publish demo piece"}
            </Button>
          </section>
        </div>
      </section>

      {previewOpen && (
        <div className="modal-bg" onMouseDown={() => setPreviewOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-copy">
              <span className="overline">Customer view</span>
              <h2>{visualScan ? "Artwork recognized." : "NFC tag detected."}</h2>
              <p>This is the moment the physical product becomes a media surface. The demo simulates the garment-to-phone handoff.</p>
              <div className="flow">
                <div><b>1</b><span>{visualScan ? "Camera finds the artwork" : "Phone reads NFC tag"}</span></div>
                <div><b>2</b><span>Piece ID resolves to its experience</span></div>
                <div><b>3</b><span>{mediaKind} opens instantly</span></div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>Back to studio</Button>
            </div>

            <div className="phone">
              <div className="notch" />
              <div className="screen">
                <div className="phone-head"><strong>smartwear</strong><span>LIVE</span></div>
                <div className="media">
                  {mediaUrl && mediaKind === "Video" ? (
                    <video src={mediaUrl} controls playsInline />
                  ) : mediaUrl && mediaKind === "Audio" ? (
                    <div className="media-placeholder">
                      <div className="album">SW</div>
                      <strong>Attached audio</strong>
                      <audio src={mediaUrl} controls />
                    </div>
                  ) : mediaUrl && mediaKind === "Link" ? (
                    <div className="media-placeholder">
                      <div className="external"><ExternalLink size={22} strokeWidth={1.7} aria-hidden="true" /></div>
                      <strong>Interactive destination</strong>
                      <small>{mediaUrl}</small>
                    </div>
                  ) : (
                    <div className="media-placeholder">
                      <div className="album">SW</div>
                      <div className="play"><Play size={16} strokeWidth={1.8} aria-hidden="true" /></div>
                      <small>YOUR MEDIA PLAYS HERE</small>
                    </div>
                  )}
                </div>
                <div className="phone-copy">
                  <span>Edition 001</span>
                  <h3>Interactive {product}</h3>
                  <p>Tap. Scan. Watch. The connected content can change without reprinting the garment.</p>
                </div>
              </div>
            </div>

            <Button variant="quiet" size="xs" className="close" onClick={() => setPreviewOpen(false)} aria-label="Close preview"><X size={16} strokeWidth={1.8} aria-hidden="true" /></Button>
          </div>
        </div>
      )}
    </main>
  );
}

function Heading({ number, title, aside }: { number: string; title: string; aside?: string }) {
  return (
    <div className="heading">
      <div><span>{number}</span><h2>{title}</h2></div>
      {aside && <small>{aside}</small>}
    </div>
  );
}

function Rule() {
  return <div className="rule" />;
}

function Toggle({
  enabled, icon, title, subtitle, onClick,
}: {
  enabled: boolean; icon: ReactNode; title: string; subtitle: string; onClick: () => void;
}) {
  return (
    <div
      className={enabled ? "toggle enabled" : "toggle"}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div>
        <span className="toggle-icon">{icon}</span>
        <div><strong>{title}</strong><small>{subtitle}</small></div>
      </div>
      <Switch checked={enabled} onChange={() => onClick()} label={title} />
    </div>
  );
}
