/**
 * Hand-written to match supabase/migrations. Regenerate once the project
 * exists and this file becomes the generated one:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 */

export type Layout = "masonry" | "carousel" | "single";
/** Templates for the carousel layout. Not a fourth layout. */
export type CarouselStyle = "rail" | "marquee" | "spotlight";
export type Theme = "light" | "dark" | "auto";
export type TestimonialType = "text" | "video";
export type TestimonialStatus = "pending" | "approved" | "rejected";

export type Space = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  accent_color: string;
  prompt_question: string;
  thankyou_message: string;
  allow_text: boolean;
  allow_video: boolean;
  require_photo: boolean;
  show_ratings: boolean;
  created_at: string;
};

/** What collection_space() returns: the public subset, no user_id. */
export type PublicSpace = Pick<
  Space,
  | "id"
  | "slug"
  | "name"
  | "logo_url"
  | "accent_color"
  | "prompt_question"
  | "thankyou_message"
  | "allow_text"
  | "allow_video"
  | "require_photo"
  | "show_ratings"
>;

export type Testimonial = {
  id: string;
  space_id: string;
  type: TestimonialType;
  body: string | null;
  rating: number | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  poster_url: string | null;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  status: TestimonialStatus;
  consent_given: boolean;
  submitted_at: string;
  approved_at: string | null;
};

export type Wall = {
  id: string;
  space_id: string;
  layout: Layout;
  carousel_style: CarouselStyle;
  theme: Theme;
  accent_color: string | null;
  max_items: number;
  show_ratings: boolean;
  include_video: boolean;
  created_at: string;
};

/** The shape wall_payload() returns, and therefore the widget's only contract. */
export type WallPayload = {
  wall: {
    id: string;
    layout: Layout;
    carousel_style: CarouselStyle;
    theme: Theme;
    accent_color: string;
    show_ratings: boolean;
    include_video: boolean;
  };
  space: { name: string; logo_url: string | null };
  testimonials: Array<
    Pick<
      Testimonial,
      | "id"
      | "type"
      | "body"
      | "rating"
      | "video_url"
      | "video_duration_seconds"
      | "poster_url"
      | "author_name"
      | "author_role"
      | "author_company"
      | "author_avatar_url"
    >
  >;
};

export type SubmitTestimonialArgs = {
  p_slug: string;
  p_type: TestimonialType;
  p_author_name: string;
  p_consent: boolean;
  p_body?: string | null;
  p_rating?: number | null;
  p_video_url?: string | null;
  p_video_duration?: number | null;
  p_poster_url?: string | null;
  p_author_role?: string | null;
  p_author_company?: string | null;
  p_author_avatar_url?: string | null;
};
