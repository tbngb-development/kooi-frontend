// src/components/brochure/BrochureReviewForm.tsx

'use client';

import { useState }   from 'react';
import { Card }       from '@/components/ui/Card';
import { Button }     from '@/components/ui/Button';
import { Input }      from '@/components/ui/Input';
import { AlertCircle, ChevronLeft, CheckCircle2, Info } from 'lucide-react';
import type { FlattenedBrochure } from '@/types';

interface BrochureReviewFormProps {
  data:      FlattenedBrochure;
  isSaving:  boolean;
  onConfirm: (edited: FlattenedBrochure) => void;
  onBack:    () => void;
}

// Fields that are critical for AI agent — highlighted if missing
const CRITICAL_FIELDS = [
  'projectName',
  'developerName',
  'fullAddress',
  'configurations',
  'startingPrice',
] as const;

export function BrochureReviewForm({
  data,
  isSaving,
  onConfirm,
  onBack,
}: BrochureReviewFormProps) {
  const [edited, setEdited] = useState<FlattenedBrochure>({ ...data });

  const missingCritical = CRITICAL_FIELDS.filter((f) => {
    const val = edited[f];
    if (Array.isArray(val)) return val.length === 0;
    return val === null || val === undefined || val === '';
  });

  const updateField = <K extends keyof FlattenedBrochure>(
    key: K,
    value: FlattenedBrochure[K]
  ) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const formatPrice = (amount: number | null | undefined) => {
    if (!amount) return '';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000)   return `₹${(amount / 100000).toFixed(0)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Confidence + warnings banner */}
      <div
        className={[
          'rounded-lg border p-4',
          edited.confidence >= 0.7
            ? 'bg-green-50 border-green-100'
            : 'bg-amber-50 border-amber-100',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          {edited.confidence >= 0.7 ? (
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              AI Extraction{' '}
              <span className={edited.confidence >= 0.7 ? 'text-green-600' : 'text-amber-600'}>
                {Math.round(edited.confidence * 100)}% confident
              </span>
            </p>
            {edited.extractionWarnings.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {edited.extractionWarnings.map((w, i) => (
                  <li key={i} className="text-xs text-text-muted">
                    • {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Missing critical fields warning */}
      {missingCritical.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-start gap-2">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            Some important fields are missing:{' '}
            <span className="font-medium">
              {missingCritical.join(', ')}
            </span>
            . Fill them in for better AI call quality.
          </p>
        </div>
      )}

      {/* ── Core Identity ─────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Project Identity
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Project name"
            value={edited.projectName ?? ''}
            onChange={(e) => updateField('projectName', e.target.value || null)}
            placeholder="e.g. Godrej Bannerghatta"
          />
          <Input
            label="Developer name"
            value={edited.developerName ?? ''}
            onChange={(e) => updateField('developerName', e.target.value || null)}
            placeholder="e.g. Godrej Properties"
          />
          <Input
            label="RERA number"
            value={edited.reraNumber ?? ''}
            onChange={(e) => updateField('reraNumber', e.target.value || null)}
            placeholder="PRM/KA/RERA/..."
          />
          <Input
            label="Contact number"
            value={edited.contactNumber ?? ''}
            onChange={(e) => updateField('contactNumber', e.target.value || null)}
            placeholder="+91 XXXXXXXXXX"
          />
        </div>
      </Card>

      {/* ── Location ──────────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Location
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            value={edited.city ?? ''}
            onChange={(e) => updateField('city', e.target.value || null)}
            placeholder="Bengaluru"
          />
          <Input
            label="Area"
            value={edited.area ?? ''}
            onChange={(e) => updateField('area', e.target.value || null)}
            placeholder="Bannerghatta"
          />
          <div className="col-span-2">
            <Input
              label="Full address"
              value={edited.fullAddress ?? ''}
              onChange={(e) => updateField('fullAddress', e.target.value || null)}
              placeholder="Full property address"
            />
          </div>
        </div>
      </Card>

      {/* ── Property Specs ─────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Property Specs
        </h3>
        <div className="flex flex-col gap-3">
          {/* Configurations */}
          <div>
            <label className="text-sm font-medium text-text-primary">
              Configurations
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {edited.configurations.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'configurations',
                        edited.configurations.filter((_, idx) => idx !== i)
                      )
                    }
                    className="hover:text-error"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {edited.configurations.length === 0 &&
                'No configurations extracted — add manually if needed'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Min size (sqft)"
              type="number"
              value={edited.sizeMin ?? ''}
              onChange={(e) =>
                updateField('sizeMin', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="1200"
            />
            <Input
              label="Max size (sqft)"
              type="number"
              value={edited.sizeMax ?? ''}
              onChange={(e) =>
                updateField('sizeMax', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="2700"
            />
            <Input
              label="Total units"
              type="number"
              value={edited.totalUnits ?? ''}
              onChange={(e) =>
                updateField('totalUnits', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="500"
            />
          </div>
        </div>
      </Card>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Pricing
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Starting price (₹)"
              type="number"
              value={edited.startingPrice ?? ''}
              onChange={(e) =>
                updateField('startingPrice', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="14400000"
            />
            {edited.startingPrice && (
              <p className="text-xs text-text-muted mt-1">
                = {formatPrice(edited.startingPrice)}
              </p>
            )}
          </div>
          <div>
            <Input
              label="Max price (₹)"
              type="number"
              value={edited.maxPrice ?? ''}
              onChange={(e) =>
                updateField('maxPrice', e.target.value ? Number(e.target.value) : null)
              }
              placeholder="32400000"
            />
            {edited.maxPrice && (
              <p className="text-xs text-text-muted mt-1">
                = {formatPrice(edited.maxPrice)}
              </p>
            )}
          </div>
          <Input
            label="Price per sqft (₹)"
            type="number"
            value={edited.pricePerSqft ?? ''}
            onChange={(e) =>
              updateField('pricePerSqft', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="12000"
          />
          <Input
            label="Price label"
            value={edited.priceLabel ?? ''}
            onChange={(e) => updateField('priceLabel', e.target.value || null)}
            placeholder="PRE-LAUNCH PRICE ₹12,000/sqft"
          />
        </div>
      </Card>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Timeline
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Possession date"
            value={edited.possessionDate ?? ''}
            onChange={(e) => updateField('possessionDate', e.target.value || null)}
            placeholder="December 2031"
          />
          <div>
            <label className="text-sm font-medium text-text-primary">
              Construction status
            </label>
            <select
              value={edited.constructionStatus ?? 'unknown'}
              onChange={(e) => updateField('constructionStatus', e.target.value)}
              className="w-full h-10 px-3 mt-1.5 rounded-md border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="pre-launch">Pre-launch</option>
              <option value="under-construction">Under Construction</option>
              <option value="ready-to-move">Ready to Move</option>
              <option value="completed">Completed</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── Qualification Questions ────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          AI Qualifying Questions
        </h3>
        <p className="text-xs text-text-muted mb-4">
          These are asked by your AI agent during calls
        </p>
        <div className="flex flex-col gap-2">
          {edited.keyQualifyingQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-text-muted font-medium w-5 pt-2.5 shrink-0">
                {i + 1}.
              </span>
              <input
                value={q}
                onChange={(e) => {
                  const updated = [...edited.keyQualifyingQuestions];
                  updated[i] = e.target.value;
                  updateField('keyQualifyingQuestions', updated);
                }}
                className="flex-1 h-9 px-3 rounded-md border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'keyQualifyingQuestions',
                    edited.keyQualifyingQuestions.filter((_, idx) => idx !== i)
                  )
                }
                className="text-text-muted hover:text-error mt-1.5 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField('keyQualifyingQuestions', [
                ...edited.keyQualifyingQuestions,
                '',
              ])
            }
            className="text-xs text-primary hover:underline text-left mt-1"
          >
            + Add question
          </button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => onConfirm(edited)}
          loading={isSaving}
        >
          Confirm & Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          leftIcon={<ChevronLeft size={14} />}
          onClick={onBack}
          disabled={isSaving}
        >
          Re-upload
        </Button>
      </div>
    </div>
  );
}