"use client";

import { TestimonialCard } from "@/components/testimonial-card";
import {
  WALL_TEMPLATES,
  WALL_TEMPLATE_CSS,
  type CardStyle,
} from "@/lib/wall-templates";
import type { WallItem } from "@/lib/sample";
import "./template-picker.css";

const example: WallItem = {
  id: "template-sample",
  type: "text",
  body: "The little details make all the difference. I’m a little obsessed.",
  rating: 5,
  author_name: "Sophie Bennett",
  author_role: "Designer & happy customer",
  author_company: null,
  author_avatar_url: "/images/portrait-1.jpg",
  video_url: null,
  poster_url: null,
  video_duration_seconds: null,
};

export function TemplatePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: CardStyle;
  onChange: (value: CardStyle) => void;
  disabled?: boolean;
}) {
  return (
    <div className="template-gallery" role="group" aria-label="Card template">
      <style>{WALL_TEMPLATE_CSS}</style>
      {WALL_TEMPLATES.map((template) => (
        <button
          key={template.key}
          type="button"
          className="template-option"
          aria-pressed={value === template.key}
          aria-label={`${template.name} template`}
          disabled={disabled}
          onClick={() => onChange(template.key)}
        >
          <span
            className="template-art"
            aria-hidden="true"
            style={{ background: template.color }}
          >
            <span
              className="vouch-design template-miniature"
              data-theme="light"
              data-card-style={template.key}
            >
              <TestimonialCard t={example} appearance={template.key} />
            </span>
            <span className="template-selected">✓</span>
          </span>
          <span className="template-name">{template.name}</span>
          <span className="template-description">{template.description}</span>
        </button>
      ))}
    </div>
  );
}
