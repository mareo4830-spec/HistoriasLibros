import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CloudUpload,
  Feather,
  Heart,
  ImagePlus,
  LockKeyhole,
  Mail,
  Minus,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2 | 3;

type FormState = {
  motive: string;
  email: string;
  dedication: string;
};

const motives = ['Te quiero mucho', 'Feliz cumpleaños', 'Feliz aniversario', 'Para alguien especial'];
const MAX_PHOTOS = 30;

function App() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({ motive: motives[0], email: '', dedication: '' });
  const [photos, setPhotos] = useState<File[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const photoUrls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);

  useEffect(() => () => photoUrls.forEach((url) => URL.revokeObjectURL(url)), [photoUrls]);

  const addPhotos = (incomingFiles: File[]) => {
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    setPhotos((current) => [...current, ...imageFiles].slice(0, MAX_PHOTOS));
    setError('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addPhotos(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addPhotos(Array.from(event.dataTransfer.files));
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setActivePage((page) => Math.min(page, Math.max(0, photos.length - 2)));
  };

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const canContinue = form.email.trim().includes('@');

const submitOrder = async () => {
    setIsSending(true);
    setError('');
    
    const { data: order, error: insertError } = await supabase
      .from('memory_book_orders')
      .insert({ email: form.email.trim(), motive: form.motive, dedication: form.dedication.trim(), photo_count: photos.length })
      .select('id')
      .maybeSingle();

    if (insertError || !order) {
      setError('No pudimos guardar tu pedido. Revisa tu conexión e inténtalo de nuevo.');
      setIsSending(false);
      return;
    }

    for (const [index, photo] of photos.entries()) {
      const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
      const { error: uploadError } = await supabase.storage
        .from('memory-book-photos')
        .upload(`${order.id}/${String(index + 1).padStart(2, '0')}.${extension}`, photo, { upsert: false });
      
      if (uploadError) {
        setError('El pedido se guardó, pero una foto no pudo subirse. Inténtalo de nuevo.');
        setIsSending(false);
        return;
      }
    }

    if (videoFile) {
      await supabase.storage
        .from('memory-book-photos')
        .upload(`${order.id}/video.mp4`, videoFile);
    }

    if (audioFile) {
      await supabase.storage
        .from('memory-book-photos')
        .upload(`${order.id}/cancion.mp3`, audioFile);
    }

    setIsSending(false);
    setIsSent(true);
  };

  const nextStep = () => {
  
    const scrollPos = window.scrollY;

  
    const nextStep = () => {
    const scrollPos = window.scrollY;

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPos, behavior: 'instant' });
    });
  };

  
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPos, behavior: 'instant' });
    });
  };

  const previousStep = () => {
    setStep((current) => (current === 1 ? 1 : (current - 1) as Step));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Nuestra historia, inicio">
          <span className="brand-mark"><BookOpen size={18} strokeWidth={1.7} /></span>
          <span>Nuestra historia</span>
        </a>
        <div className="topbar-note"><LockKeyhole size={13} /> Un regalo hecho solo para ti</div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> Un regalo que se puede tocar</p>
          <h1>Hay historias que<br /><em>merecen quedarse.</em></h1>
          <p className="hero-text">Convierte tus recuerdos favoritos en un libro que cobra vida página a página. Una experiencia íntima, hecha con tus fotos y tus palabras.</p>
          <a className="hero-cta" href="#crear"><span>Crear mi libro</span><ArrowDown size={17} /></a>
          <div className="hero-trust"><ShieldCheck size={15} /> Tus fotos son privadas y están protegidas</div>
        </div>
        <BookPreview photoUrls={photoUrls} activePage={activePage} setActivePage={setActivePage} />
      </section>

      <section className="story-strip">
        <div><span className="strip-number">01</span><strong>Elige el momento</strong><span>Que quieres celebrar</span></div>
        <div><span className="strip-number">02</span><strong>Sube tus recuerdos</strong><span>Hasta 30 fotografías</span></div>
        <div><span className="strip-number">03</span><strong>Lo hacemos realidad</strong><span>Y llega a tus manos</span></div>
      </section>

      <section className="creator-section" id="crear">
        <div className="section-heading">
          <p className="eyebrow">Diseña tu recuerdo</p>
          <h2>Tu libro empieza aquí.</h2>
          <p>Solo necesitas unos minutos para crear algo que durará para siempre.</p>
        </div>
        <div className="creator-layout">
          <div className="form-card">
            {isSent ? <SuccessState email={form.email} onReset={() => { setIsSent(false); setStep(1); setPhotos([]); setForm({ motive: motives[0], email: '', dedication: '' }); }} /> : <>
              <div className="stepper">
                {[1, 2, 3].map((number) => <div className={`step-item ${step >= number ? 'active' : ''}`} key={number}><span>{step > number ? <Check size={14} /> : number}</span><small>{number === 1 ? 'Datos' : number === 2 ? 'Recuerdos' : 'Enviar'}</small></div>)}
              </div>
              {step === 1 && <StepOne form={form} updateForm={updateForm} />}
              {step === 2 && <StepTwo photos={photos} dedication={form.dedication} onDedicationChange={(value) => updateForm('dedication', value)} onDrop={handleDrop} onChange={handleFileChange} onRemove={removePhoto} isDragging={isDragging} setIsDragging={setIsDragging} fileInputRef={fileInputRef} videoFile={videoFile} audioFile={audioFile} onVideoChange={handleVideoChange} onAudioChange={handleAudioChange} />}
              {step === 3 && <StepThree form={form} photoCount={photos.length} />}
              {error && <div className="error-message"><X size={15} /> {error}</div>}
              <div className="form-actions">
                {step > 1 && <button className="button button-ghost" type="button" onClick={previousStep}><ArrowLeft size={16} /> Atrás</button>}
                <button className="button button-primary" type="button" onClick={nextStep} disabled={isSending}>{isSending ? 'Guardando...' : step === 3 ? <><Send size={16} /> Enviar mi historia</> : <>Continuar <ArrowRight size={16} /></>}</button>
              </div>
              <p className="card-footnote"><LockKeyhole size={12} /> Tus datos están protegidos y nunca se comparten.</p>
            </>}
          </div>
          <aside className="aside-note"><Feather size={23} /><p>“Los recuerdos no viven en las cosas. Viven en las historias que contamos sobre ellas.”</p><span>— Una pequeña verdad</span></aside>
        </div>
      </section>

      <footer className="footer"><span>© 2024 Nuestra historia</span><span>Creado con calma y cariño</span><Heart size={14} fill="currentColor" /></footer>
    </main>
  );

}
function StepOne({ form, updateForm }: { form: FormState; updateForm: (field: keyof FormState, value: string) => void }) {
  return <div className="step-content"><p className="step-kicker">Paso 01 / 03</p><h3>¿Qué quieres decirle?</h3><p className="step-description">Elige la ocasión que aparecerá en la primera página de tu libro.</p><label className="field-label" htmlFor="motive">Motivo del regalo</label><div className="select-wrap"><select id="motive" value={form.motive} onChange={(event) => updateForm('motive', event.target.value)}>{motives.map((motive) => <option key={motive}>{motive}</option>)}</select><ChevronDown size={17} /></div><label className="field-label" htmlFor="email">Tu correo electrónico</label><div className="input-wrap"><Mail size={17} /><input id="email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} style={{ fontSize: '16px' }} placeholder="tu@correo.com" /></div><p className="field-hint">Te enviaremos aquí la confirmación de tu pedido.</p></div>;
}

function StepTwo({ photos, dedication, onDedicationChange, onDrop, onChange, onRemove, isDragging, setIsDragging, fileInputRef, onVideoChange, onAudioChange }) {
  return (
    <div className="step-content">
      <p className="step-kicker">Paso 02 / 03</p>
      <h3>Llena sus páginas.</h3>
      <p className="step-description">Sube los recuerdos, el vídeo final y la canción para darle vida al libro.</p>
      
      {/* 1. ZONA DE FOTOS */}
      <div 
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onChange} 
          multiple 
          accept="image/png, image/jpeg, image/webp" 
          style={{ display: 'none' }} 
        />
        <div className="dropzone-content">
          <Upload size={28} style={{ color: '#c5a059', marginBottom: '10px' }} />
          haz clic para buscar y subir tus fotos
          <span>JPG, PNG o WEBP · Máximo 30 fotos</span>
        </div>
      </div>

      {/* Contador de fotos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8c7a6b', margin: '8px 0 20px 0' }}>
        <span>Tus recuerdos</span>
        <span>{photos.length} / 30 fotos</span>
      </div>

      {/* 2. DEDICATORIA */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#4a3b32', marginBottom: '6px', fontWeight: '500' }}>
          Una dedicatoria personal <span style={{ opacity: 0.6 }}>(Opcional)</span>
        </label>
        <textarea 
          value={dedication} 
          onChange={onDedicationChange}
          placeholder="Escribe unas palabras que quieras que acompañen tus recuerdos..."
          rows={3}
          style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #dfd3bd', borderRadius: '4px', resize: 'none', fontFamily: 'inherit', fontSize: '16px' }}
        />
      </div>

      {/* 3. VÍDEO Y MÚSICA MP3 */}
      <div style={{ borderTop: '1px dashed #dfd3bd', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Subir Vídeo */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#4a3b32', marginBottom: '6px', fontWeight: '500' }}>
            <h3>Sube tu vídeo para el final </h3><span style={{ opacity: 0.6 }}>(Opcional)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#faf6ee', border: '1px dashed #dfd3bd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#4a3b32', transition: 'all 0.2s' }}>
            <span style={{ fontWeight: '500' }}>{videoFile ? `Vídeo seleccionado: ${videoFile.name}` : 'Haz clic para seleccionar el vídeo (MP4)'}</span>
            <input 
              type="file" 
              accept="video/mp4,video/quicktime,video/webm"
              onChange={onVideoChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Subir Canción MP3 */}
        <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#4a3b32', marginBottom: '6px', fontWeight: '500' }}>
           <h3> Canción en MP3 para el fondo </h3><span style={{ opacity: 0.6 }}>(Opcional)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#faf6ee', border: '1px dashed #dfd3bd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#4a3b32', transition: 'all 0.2s' }}>
            <span style={{ fontWeight: '500' }}>{audioFile ? `Audio seleccionado: ${audioFile.name}` : 'Haz clic para seleccionar la canción (MP3)'}</span>
            <input 
              type="file" 
              accept="audio/mp3,audio/wav,audio/m4a"
              onChange={onAudioChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

      </div>

    </div>
  );
}

function StepThree({ form, photoCount }: { form: FormState; photoCount: number }) {
  return <div className="step-content"><p className="step-kicker">Paso 03 / 03</p><h3>Todo listo para guardar.</h3><p className="step-description">Revisa los detalles. Después convertiremos tus recuerdos en una experiencia para abrir y volver a abrir.</p><div className="summary-card"><div><span>Motivo</span><strong>{form.motive}</strong></div><div><span>Correo</span><strong>{form.email}</strong></div><div><span>Fotografías</span><strong>{photoCount} {photoCount === 1 ? 'recuerdo' : 'recuerdos'}</strong></div></div><div className="ready-note"><Sparkles size={17} /><div><strong>Tu libro está esperando.</strong><span>Al enviar, guardaremos tu pedido y tus fotos de forma segura.</span></div></div></div>;
}

function SuccessState({ email, onReset }: { email: string; onReset: () => void }) {
  return <div className="success-state"><span className="success-icon"><Check size={27} /></span><p className="step-kicker">Historia recibida</p><h3>Ya está en camino.</h3><p>Hemos guardado tu libro y enviaremos los siguientes pasos a <strong>{email}</strong>.</p><button className="button button-ghost" type="button" onClick={onReset}><RotateCcw size={15} /> Crear otro libro</button></div>;
}

function BookPreview({ photoUrls, activePage, setActivePage }: { photoUrls: string[]; activePage: number; setActivePage: (page: number) => void }) {
  const totalPages = photoUrls.length + 1;
  const nextPage = () => setActivePage(Math.min(totalPages - 1, activePage + 1));
  const previousPage = () => setActivePage(Math.max(0, activePage - 1));
  const isCover = activePage === 0;
  return <div className="book-stage"><div className="book-shadow" /><div className={`book ${isCover ? 'show-cover' : 'show-page'}`}><div className="book-cover"><div className="cover-inner"><span className="cover-rule" /><BookOpen size={20} /><p>Un libro de</p><h3>Nuestra<br />historia</h3><span className="cover-ornament">✦</span><small>Recuerdos que viven</small></div></div><div className="book-page"><div className="page-paper">{photoUrls[activePage - 1] ? <img src={photoUrls[activePage - 1]} alt={`Página ${activePage}`} /> : <div className="empty-page"><Plus size={21} /><span>Tu próximo recuerdo</span></div>}<div className="page-caption"><span>página {String(activePage).padStart(2, '0')}</span><span>✦</span></div></div></div></div><div className="book-controls"><button type="button" onClick={previousPage} disabled={activePage === 0} aria-label="Página anterior"><ArrowLeft size={15} /></button><span>{isCover ? 'Portada' : `${activePage} / ${photoUrls.length || 1}`}</span><button type="button" onClick={nextPage} disabled={activePage === totalPages - 1} aria-label="Página siguiente"><ArrowRight size={15} /></button></div><div className="book-label"><span className="label-dot" /> {photoUrls.length ? `${photoUrls.length} ${photoUrls.length === 1 ? 'página creada' : 'páginas creadas'}` : 'Tu libro, aún por escribir'}</div></div>;
  }

export default App;
