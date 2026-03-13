"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCommunesByWilayaId } from "algeria-locations";
import { track } from "@vercel/analytics";

interface ProductVariant {
  id: string;
  color_name_ar: string;
  color_name_fr: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
}

interface Product {
  id: string;
  name_ar: string;
  name_fr: string;
  price: number;
  product_variants?: ProductVariant[];
}

const WILAYAS = [
  { code: 1, name: '01 - أدرار' }, { code: 2, name: '02 - الشلف' },
  { code: 3, name: '03 - الأغواط' }, { code: 4, name: '04 - أم البواقي' },
  { code: 5, name: '05 - باتنة' }, { code: 6, name: '06 - البجاية' },
  { code: 7, name: '07 - بسكرة' }, { code: 8, name: '08 - بشار' },
  { code: 9, name: '09 - البليدة' }, { code: 10, name: '10 - البويرة' },
  { code: 11, name: '11 - تمنراست' }, { code: 12, name: '12 - تبسة' },
  { code: 13, name: '13 - تلمسان' }, { code: 14, name: '14 - تيارت' },
  { code: 15, name: '15 - تيزي وزو' }, { code: 16, name: '16 - الجزائر' },
  { code: 17, name: '17 - الجلفة' }, { code: 18, name: '18 - جيجل' },
  { code: 19, name: '19 - سطيف' }, { code: 20, name: '20 - سعيدة' },
  { code: 21, name: '21 - سكيكدة' }, { code: 22, name: '22 - سيدي بلعباس' },
  { code: 23, name: '23 - عنابة' }, { code: 24, name: '24 - قالمة' },
  { code: 25, name: '25 - قسنطينة' }, { code: 26, name: '26 - المدية' },
  { code: 27, name: '27 - مستغانم' }, { code: 28, name: '28 - المسيلة' },
  { code: 29, name: '29 - معسكر' }, { code: 30, name: '30 - ورقلة' },
  { code: 31, name: '31 - وهران' }, { code: 32, name: '32 - البيض' },
  { code: 33, name: '33 - إليزي' }, { code: 34, name: '34 - برج بوعريريج' },
  { code: 35, name: '35 - بومرداس' }, { code: 36, name: '36 - الطارف' },
  { code: 37, name: '37 - تندوف' }, { code: 38, name: '38 - تيسمسيلت' },
  { code: 39, name: '39 - الوادي' }, { code: 40, name: '40 - خنشلة' },
  { code: 41, name: '41 - سوق أهراس' }, { code: 42, name: '42 - تيبازة' },
  { code: 43, name: '43 - ميلة' }, { code: 44, name: '44 - عين الدفلى' },
  { code: 45, name: '45 - النعامة' }, { code: 46, name: '46 - عين تموشنت' },
  { code: 47, name: '47 - غرداية' }, { code: 48, name: '48 - غليزان' },
  { code: 49, name: '49 - تيميمون' }, { code: 50, name: '50 - برج باجي مختار' },
  { code: 51, name: '51 - أولاد جلال' }, { code: 52, name: '52 - بني عباس' },
  { code: 53, name: '53 - عين صالح' }, { code: 54, name: '54 - عين قزام' },
  { code: 55, name: '55 - تقرت' }, { code: 56, name: '56 - جانت' },
  { code: 57, name: '57 - المغير' }, { code: 58, name: '58 - المنيعة' },
];

const DELIVERY: Record<string, { home: number; bureau: number }> = {
  '16': { home: 600, bureau: 400 },
  '9':  { home: 550, bureau: 350 },
  '35': { home: 550, bureau: 350 },
  '31': { home: 700, bureau: 500 },
  '25': { home: 700, bureau: 500 },
  '19': { home: 750, bureau: 550 },
  '23': { home: 750, bureau: 550 },
  '15': { home: 650, bureau: 450 },
  '6':  { home: 700, bureau: 500 },
};
const DEFAULT_DELIVERY = { home: 950, bureau: 700 };

const STEPS = [
  { n: 1, label: 'بياناتك' },
  { n: 2, label: 'التوصيل' },
  { n: 3, label: 'التأكيد' },
];

export function OrderForm({ product }: { product: Product }) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const variants = product.product_variants || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  // Track quantity per variant ID
  const [items, setItems] = useState<Record<string, number>>({});
  
  const [deliveryType, setDeliveryType] = useState<'home' | 'bureau'>('home');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', fullName: '', commune: '', address: '' });

  const totalQuantity = Object.values(items).reduce((sum, q) => sum + q, 0) || 1;

  const wilaya = WILAYAS.find(w => String(w.code) === selectedWilayaCode);
  const prices = selectedWilayaCode ? (DELIVERY[selectedWilayaCode] || DEFAULT_DELIVERY) : null;
  const shippingCost = prices ? prices[deliveryType] : 0;
  const totalPrice = (product.price * totalQuantity) + shippingCost;

  // Build a summary string for the colors chosen
  const variantDetailsAr = Object.entries(items)
    .filter(([_, q]) => q > 0)
    .map(([vid, q]) => {
      const v = variants.find(v => v.id === vid);
      return `${v?.color_name_ar} (${q})`;
    })
    .join('، ') || (variants.length > 0 ? variants[0].color_name_ar : null);

  const updateQty = (id: string, delta: number, stock: number) => {
    setItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(stock, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const goNext = () => {
    if (step === 1 && !form.phone) { toast.error('رقم الهاتف مطلوب'); return; }
    if (step === 2 && !selectedWilayaCode) { toast.error('يرجى اختيار ولايتك'); return; }
    setStep(s => s + 1);
    // Scroll form to top on step change
    const formElement = document.getElementById('order-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          fullName: form.fullName,
          address: form.address,
          communeName: form.commune,
          wilayaCode: selectedWilayaCode,
          wilayaName: wilaya?.name || '',
          deliveryType,
          shippingCost,
          productId: product.id,
          variantId: Object.keys(items).find(key => items[key] > 0) || (variants[0]?.id || null),
          variantColorAr: variantDetailsAr,
          productName: product.name_ar,
          productPrice: product.price,
          quantity: totalQuantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في الإرسال');
      
      // Track conversion in Vercel Analytics
      track('Order Created', {
        product: product.name_ar,
        total: totalPrice,
        quantity: totalQuantity,
        wilaya: wilaya?.name || 'Unknown'
      });

      router.push(`/order-success?id=${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ. حاول مجدداً.');
      setLoading(false);
    }
  };

  return (
    <div
      id="order-form"
      ref={formRef}
      style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div style={{ background: 'var(--black)', padding: '1.4rem 1.5rem', position: 'relative' }}>
        {/* Gold accent bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light), var(--gold))',
        }} />

        {/* Title + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white', marginBottom: '4px' }}>
              أكمل طلبك الآن
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>إتمام الشراء في ثوانٍ ⚡</p>
          </div>
          <div style={{
            background: 'var(--gold)', color: 'var(--black)',
            padding: '8px 16px', borderRadius: '14px',
            fontFamily: 'var(--font-latin)', fontWeight: 900, fontSize: '1.05rem',
            boxShadow: '0 4px 15px rgba(245,197,24,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1
          }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px', opacity: 0.7 }}>Total</span>
            {totalPrice.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
          {STEPS.map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: n < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: step >= n ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  color: step >= n ? 'var(--black)' : 'rgba(255,255,255,0.3)',
                  boxShadow: step >= n ? '0 0 0 4px rgba(245,197,24,0.15)' : 'none',
                  transform: step === n ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {step > n ? '✓' : n}
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: step >= n ? 800 : 500,
                  color: step >= n ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s ease', whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
              {n < 3 && (
                <div style={{
                  flex: 1, height: '3px', marginBottom: '22px',
                  background: step > n ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '99px', transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--black)' }}>
                رقم الهاتف <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                placeholder="0550 XX XX XX"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field"
                style={{ 
                  textAlign: 'right', 
                  fontFamily: 'var(--font-latin)', 
                  fontSize: '1.2rem', 
                  letterSpacing: '1px',
                  height: '60px',
                  borderRadius: '16px',
                  border: '2px solid var(--border)',
                  background: 'var(--gray-soft)'
                }}
                required
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>📱</span> رقمك في أمان، سنستخدمه فقط لتأكيد الطلب
              </p>
            </div>

            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--black)' }}>
                الاسم الكامل{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="اسمك الكامل"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="input-field"
                style={{ height: '60px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--gray-soft)' }}
              />
            </div>

            {/* Multi-Color Quantity Selector */}
            {variants.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--black)' }}>
                  اختر اللون والكمية
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {variants.map(v => {
                    const q = items[v.id] || 0;
                    const isOutOfStock = v.stock_quantity <= 0;
                    
                    return (
                      <div key={v.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--gray-soft)',
                        borderRadius: '16px',
                        border: q > 0 ? '1px solid var(--gold)' : '1px solid transparent',
                        opacity: isOutOfStock ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: v.color_hex, border: '2px solid rgba(255,255,255,0.8)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: q > 0 ? 'var(--black)' : '#555' }}>
                              {v.color_name_ar}
                            </div>
                            {isOutOfStock ? (
                              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>نفذت الكمية ❌</div>
                            ) : (
                              <div style={{ fontSize: '0.7rem', color: q > 0 ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: 700 }}>
                                متوفر: {v.stock_quantity} قطع
                              </div>
                            )}
                          </div>
                        </div>

                        {!isOutOfStock && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px', borderRadius: '12px', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)' }}>
                            <button 
                              type="button" 
                              onClick={() => updateQty(v.id, -1, v.stock_quantity)}
                              style={{ 
                                width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border)', 
                                background: q > 0 ? 'white' : 'var(--gray-soft)', fontWeight: 900, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                transition: 'all 0.15s'
                              }}
                            >-</button>
                            <span className="font-latin" style={{ fontWeight: 900, minWidth: '30px', textAlign: 'center', fontSize: '1.1rem' }}>{q}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty(v.id, 1, v.stock_quantity)}
                              disabled={q >= v.stock_quantity}
                              style={{ 
                                width: '38px', height: '38px', borderRadius: '10px', border: 'none', 
                                background: q >= v.stock_quantity ? 'var(--gray-soft)' : 'var(--black)', 
                                color: 'white', fontWeight: 900, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                opacity: q >= v.stock_quantity ? 0.3 : 1,
                                transition: 'all 0.15s'
                              }}
                            >+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalQuantity > 0 && Object.values(items).some(v => v > 0) && (
                  <div style={{ 
                    padding: '12px', background: 'var(--black)', borderRadius: '14px', 
                    fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', color: 'var(--gold)',
                    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                    <span>📦</span>
                    إجمالي السلة: {totalQuantity} قطعة
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px', color: 'var(--black)' }}>
                  الكمية
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--gray-soft)', padding: '6px 12px', borderRadius: '12px', width: 'fit-content' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const current = items['default'] || 1;
                      setItems({ 'default': Math.max(1, current - 1) });
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >-</button>
                  <span className="font-latin" style={{ fontWeight: 900, minWidth: '15px', textAlign: 'center' }}>{items['default'] || 1}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const current = items['default'] || 1;
                      setItems({ 'default': Math.min(10, current + 1) });
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>
            )}

            <button type="button" onClick={goNext} className="btn-primary"
              style={{ width: '100%', height: '62px', fontSize: '1.1rem', fontWeight: 900, borderRadius: '18px', marginTop: '0.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              التالي: التوصيل ←
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Wilaya */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--black)' }}>
                الولاية <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedWilayaCode}
                onChange={e => { setSelectedWilayaCode(e.target.value); setForm(f => ({ ...f, commune: '' })); }}
                className="input-field"
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="">-- اختر ولايتك --</option>
                {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--black)' }}>
                البلدية <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.commune}
                onChange={e => setForm(f => ({ ...f, commune: e.target.value }))}
                className="input-field"
                style={{
                  cursor: !selectedWilayaCode ? 'not-allowed' : 'pointer',
                  opacity: !selectedWilayaCode ? 0.55 : 1,
                }}
                disabled={!selectedWilayaCode}
                required
              >
                <option value="">{selectedWilayaCode ? '-- اختر بلديتك --' : '-- اختر الولاية أولاً --'}</option>
                {selectedWilayaCode && getCommunesByWilayaId(Number(selectedWilayaCode)).map((c: any) => (
                  <option key={c.id} value={c.name_ar}>{c.name_ar} - {c.name}</option>
                ))}
              </select>
            </div>

            {/* Delivery type */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px', color: 'var(--black)' }}>
                نوع التوصيل
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(['home', 'bureau'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDeliveryType(type)}
                    style={{
                      padding: '1.25rem 0.75rem', borderRadius: '20px', cursor: 'pointer',
                      border: `2px solid ${deliveryType === type ? 'var(--gold)' : 'var(--border)'}`,
                      background: deliveryType === type ? 'var(--black)' : 'white',
                      fontFamily: 'var(--font-arabic)', textAlign: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: deliveryType === type ? '0 8px 20px rgba(0,0,0,0.15)' : 'none',
                      transform: deliveryType === type ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px', filter: deliveryType === type ? 'none' : 'grayscale(1)' }}>
                      {type === 'home' ? '🏠' : '🏢'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: deliveryType === type ? 'white' : 'var(--black)' }}>
                      {type === 'home' ? 'للمنزل' : 'نقطة استلام'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-latin)', fontSize: '0.85rem', marginTop: '6px',
                      fontWeight: 800,
                      color: deliveryType === type ? 'var(--gold)' : 'var(--text-muted)',
                    }}>
                      {prices ? `${prices[type]} DZD` : (type === 'home' ? 'أسرع' : 'أوفر')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Address (home only) */}
            {deliveryType === 'home' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--black)' }}>
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  placeholder="رقم الشارع، الحي، البلدية..."
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="input-field"
                  style={{ height: '60px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--gray-soft)' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  const formElement = document.getElementById('order-form');
                  if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  width: '62px', height: '62px', borderRadius: '18px',
                  border: '2px solid var(--border)', background: 'white', cursor: 'pointer',
                  fontFamily: 'var(--font-arabic)', fontWeight: 900, fontSize: '1.2rem',
                  flexShrink: 0, transition: 'all 0.2s ease',
                }}
              >
                →
              </button>
              <button type="button" onClick={goNext} className="btn-primary"
                style={{ flex: 1, height: '62px', borderRadius: '18px', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                التالي: تأكيد الطلب ←
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 – Confirm */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <h4 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--gray-soft)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0,
              }}>📋</span>
              ملخص الطلب
            </h4>

            {/* Summary card */}
            <div style={{
              background: 'var(--gray-soft)', borderRadius: 'var(--radius-sm)',
              padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem',
            }}>
              {[
                { icon: '🛍️', label: 'المنتج', val: product.name_ar },
                { icon: '🔢', label: 'الكمية الإجمالية', val: `${totalQuantity} قطع` },
                { icon: '🎨', label: 'الألوان المختارة', val: variantDetailsAr || '—' },
                { icon: '📞', label: 'الهاتف', val: form.phone },
                { icon: '📍', label: 'الولاية', val: wilaya?.name || '—' },
                {
                  icon: deliveryType === 'home' ? '🏠' : '🏢',
                  label: 'التوصيل',
                  val: deliveryType === 'home' ? 'توصيل للمنزل' : 'نقطة استلام',
                },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                    <span>{icon}</span>{label}:
                  </span>
                  <span style={{ fontWeight: 700, textAlign: 'left', wordBreak: 'break-word' }}>{val}</span>
                </div>
              ))}

              {/* Price breakdown */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  ['سعر المنتج', `${product.price.toLocaleString()} DZD`],
                  ['رسوم التوصيل', `+${shippingCost.toLocaleString()} DZD`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}:</span>
                    <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontWeight: 900, fontSize: '1.1rem',
                  borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.2rem',
                }}>
                  <span>المجموع الكلي:</span>
                  <span style={{ fontFamily: 'var(--font-latin)', color: 'var(--gold-dark)' }}>
                    {totalPrice.toLocaleString()} DZD
                  </span>
                </div>
              </div>
            </div>

            {/* COD note */}
            <div style={{
              background: 'rgba(245,197,24,0.08)',
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              fontSize: '0.84rem', lineHeight: 1.7,
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <span style={{ flexShrink: 0 }}>💡</span>
              <span>الدفع عند الاستلام فقط. سنتصل بك لتأكيد الطلب خلال 24 ساعة.</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  const formElement = document.getElementById('order-form');
                  if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  width: '62px', height: '62px', borderRadius: '18px',
                  border: '2px solid var(--border)', background: 'white', cursor: 'pointer',
                  fontSize: '1.2rem', flexShrink: 0, fontFamily: 'var(--font-arabic)',
                  transition: 'all 0.2s ease',
                }}
              >
                →
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                style={{
                  flex: 1, height: '62px', borderRadius: '18px',
                  border: 'none', fontWeight: 900, fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 10px 25px rgba(0,0,0,0.2)',
                  background: 'var(--black)', color: 'var(--gold)',
                }}
              >
                {!loading && '✅ إتمام الطلب الآن'}
              </button>
            </div>

            {/* Trust strip */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '16px',
              paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              {['🔒 دفع آمن', '↩️ ضمان الإرجاع', '🚚 توصيل سريع'].map(item => (
                <span key={item} style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* ── DYNAMIC MOBILE STICKY BAR ── */}
      <div 
        className="mobile-sticky-bar"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '22px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isFormVisible ? 0 : 1,
          transform: isFormVisible ? 'translateY(100px)' : 'translateY(0)',
          pointerEvents: isFormVisible ? 'none' : 'auto',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            color: 'rgba(255,255,255,0.5)', 
            marginBottom: '1px',
            textTransform: 'uppercase'
          }}>
            اطلب الآن بـ
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ 
              fontFamily: 'var(--font-latin)', 
              fontWeight: 900, 
              fontSize: '1.2rem',
              color: 'var(--gold)',
            }}>
              {totalPrice.toLocaleString()}
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: 'white',
              fontFamily: 'var(--font-latin)',
              opacity: 0.8
            }}>
              DZD
            </span>
          </div>
        </div>

        <a 
          href="#order-form" 
          className="btn-gold glow-on-hover"
          style={{ 
            textDecoration: 'none', 
            fontSize: '0.85rem', 
            borderRadius: '14px', 
            padding: '0 1.25rem', 
            height: '46px', 
            flexShrink: 0,
            background: 'var(--gold)',
            color: 'var(--black)',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(245,197,24,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>إتمام الطلب</span>
          <span style={{ fontSize: '1.1rem' }}>🛒</span>
        </a>

        <style>{`
          @media (min-width: 900px) {
            .mobile-sticky-bar { display: none !important; }
          }
          @keyframes glow-pulse {
            0% { box-shadow: 0 4px 12px rgba(245,197,24,0.3); }
            50% { box-shadow: 0 4px 20px rgba(245,197,24,0.6); }
            100% { box-shadow: 0 4px 12px rgba(245,197,24,0.3); }
          }
          .glow-on-hover:hover {
            animation: glow-pulse 1.5s infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
