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
    collectionsSection {
      title,
      collections[] {
        title,
        collectionHandle,
        "imageUrl": image.asset->url
      }
    },
    textMarquee,
    productsSection,
    productOfTheMonth,
    testimonialsSection {
      enabled,
      title,
      subtitle,
      backgroundColor,
      testimonials
    },
    collectionsSection2 {
      enabled,
      title,
      collections[] {
        title,
        collectionHandle,
        "imageUrl": image.asset->url
      }
    },
    imageBanner {
      enabled,
      "imageUrl": image.asset->url,
      overlayText,
      link,
      textPosition
    },
    ctaBox{
      ctaText,
      ctaSubText,
      ctaButtonLabel,
      ctaLink,
      ctaImageAlt,
      "ctaImage": ctaImage.asset->url
    },
    footer
  }`

export const INSTANT_PROCESSING_QUERY = `*[_type == "instantProcessing"][0]{
  hero {
    "videoMp4": videoMp4Url,
    "videoWebm": videoWebmUrl,
    "posterUrl": posterImage.asset->url,
    overlayOpacity,
    headline,
    subheadline,
    ctaLabel,
    ctaLink
  },
  aboutSection,
  logoMarquee {
    logos[] {
      "url": asset->url,
      alt
    }
  },
  imageBanner {
    "imageUrl": image.asset->url,
    overlayText,
    textPosition
  },
  howItWorks {
    title,
    subtitle,
    steps[] {
      stepNumber,
      title,
      description,
      icon
    }
  },
  ctaSection {
    ctaText,
    ctaSubText,
    ctaButtonLabel,
    ctaLink,
    ctaImageAlt,
    "ctaImage": ctaImage.asset->url
  }
}`
