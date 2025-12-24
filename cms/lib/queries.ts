export const LANDING_PAGE_QUERY = `*[_type == "landingPage"][0]{
    theme,
    header {
      logoText,
      navLinks,
      loginLabel,
      transparentHeader,
      scrolledHeader
    },
    hero {
      backgroundType,
      "videoMp4": coalesce(videoMp4Url, videoMp4File.asset->url),
      "videoWebm": coalesce(videoWebmUrl, videoWebmFile.asset->url),
      "posterUrl": posterImage.asset->url,
      "backgroundImageUrl": backgroundImage.asset->url,
      overlayColor,
      overlayOpacity,
      headlineMode,
      headline,
      "headlineImageUrl": headlineImage.asset->url,
      subheadline,
      ctas
    },
    productsSection,
    productOfTheMonth,
    testimonialsSection {
      enabled,
      title,
      subtitle,
      backgroundColor,
      testimonials
    },
    footer
  }`
  