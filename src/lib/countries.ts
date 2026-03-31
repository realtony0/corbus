import { Country } from "./types";

export const countries: Country[] = [
  // Afrique de l'Ouest (FCFA)
  { code: "SN", name: "Sénégal", currency: "XOF", currencySymbol: "FCFA", flag: "🇸🇳", requiresAddress: false },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", currencySymbol: "FCFA", flag: "🇨🇮", requiresAddress: true },
  { code: "ML", name: "Mali", currency: "XOF", currencySymbol: "FCFA", flag: "🇲🇱", requiresAddress: true },
  { code: "BF", name: "Burkina Faso", currency: "XOF", currencySymbol: "FCFA", flag: "🇧🇫", requiresAddress: true },
  { code: "BJ", name: "Bénin", currency: "XOF", currencySymbol: "FCFA", flag: "🇧🇯", requiresAddress: true },
  { code: "TG", name: "Togo", currency: "XOF", currencySymbol: "FCFA", flag: "🇹🇬", requiresAddress: true },
  { code: "NE", name: "Niger", currency: "XOF", currencySymbol: "FCFA", flag: "🇳🇪", requiresAddress: true },
  { code: "GW", name: "Guinée-Bissau", currency: "XOF", currencySymbol: "FCFA", flag: "🇬🇼", requiresAddress: true },
  // Afrique de l'Ouest (autres)
  { code: "GN", name: "Guinée", currency: "GNF", currencySymbol: "GNF", flag: "🇬🇳", requiresAddress: true },
  { code: "GM", name: "Gambie", currency: "GMD", currencySymbol: "GMD", flag: "🇬🇲", requiresAddress: true },
  { code: "MR", name: "Mauritanie", currency: "MRU", currencySymbol: "MRU", flag: "🇲🇷", requiresAddress: true },
  { code: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦", flag: "🇳🇬", requiresAddress: true },
  { code: "GH", name: "Ghana", currency: "GHS", currencySymbol: "GH₵", flag: "🇬🇭", requiresAddress: true },
  // Afrique Centrale (FCFA)
  { code: "CM", name: "Cameroun", currency: "XAF", currencySymbol: "FCFA", flag: "🇨🇲", requiresAddress: true },
  { code: "GA", name: "Gabon", currency: "XAF", currencySymbol: "FCFA", flag: "🇬🇦", requiresAddress: true },
  { code: "CG", name: "Congo", currency: "XAF", currencySymbol: "FCFA", flag: "🇨🇬", requiresAddress: true },
  { code: "CD", name: "RD Congo", currency: "CDF", currencySymbol: "FC", flag: "🇨🇩", requiresAddress: true },
  // Afrique du Nord
  { code: "MA", name: "Maroc", currency: "MAD", currencySymbol: "MAD", flag: "🇲🇦", requiresAddress: true },
  { code: "DZ", name: "Algérie", currency: "DZD", currencySymbol: "DA", flag: "🇩🇿", requiresAddress: true },
  { code: "TN", name: "Tunisie", currency: "TND", currencySymbol: "DT", flag: "🇹🇳", requiresAddress: true },
  // Afrique de l'Est
  { code: "KE", name: "Kenya", currency: "KES", currencySymbol: "KSh", flag: "🇰🇪", requiresAddress: true },
  { code: "TZ", name: "Tanzanie", currency: "TZS", currencySymbol: "TSh", flag: "🇹🇿", requiresAddress: true },
  { code: "ET", name: "Éthiopie", currency: "ETB", currencySymbol: "Br", flag: "🇪🇹", requiresAddress: true },
  { code: "RW", name: "Rwanda", currency: "RWF", currencySymbol: "RF", flag: "🇷🇼", requiresAddress: true },
  // Afrique Australe
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R", flag: "🇿🇦", requiresAddress: true },
  // Europe
  { code: "FR", name: "France", currency: "EUR", currencySymbol: "€", flag: "🇫🇷", requiresAddress: true },
  { code: "BE", name: "Belgique", currency: "EUR", currencySymbol: "€", flag: "🇧🇪", requiresAddress: true },
  { code: "CH", name: "Suisse", currency: "CHF", currencySymbol: "CHF", flag: "🇨🇭", requiresAddress: true },
  { code: "DE", name: "Allemagne", currency: "EUR", currencySymbol: "€", flag: "🇩🇪", requiresAddress: true },
  { code: "ES", name: "Espagne", currency: "EUR", currencySymbol: "€", flag: "🇪🇸", requiresAddress: true },
  { code: "IT", name: "Italie", currency: "EUR", currencySymbol: "€", flag: "🇮🇹", requiresAddress: true },
  { code: "PT", name: "Portugal", currency: "EUR", currencySymbol: "€", flag: "🇵🇹", requiresAddress: true },
  { code: "NL", name: "Pays-Bas", currency: "EUR", currencySymbol: "€", flag: "🇳🇱", requiresAddress: true },
  { code: "LU", name: "Luxembourg", currency: "EUR", currencySymbol: "€", flag: "🇱🇺", requiresAddress: true },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£", flag: "🇬🇧", requiresAddress: true },
  { code: "IE", name: "Ireland", currency: "EUR", currencySymbol: "€", flag: "🇮🇪", requiresAddress: true },
  { code: "AT", name: "Autriche", currency: "EUR", currencySymbol: "€", flag: "🇦🇹", requiresAddress: true },
  { code: "SE", name: "Suède", currency: "SEK", currencySymbol: "kr", flag: "🇸🇪", requiresAddress: true },
  { code: "NO", name: "Norvège", currency: "NOK", currencySymbol: "kr", flag: "🇳🇴", requiresAddress: true },
  { code: "DK", name: "Danemark", currency: "DKK", currencySymbol: "kr", flag: "🇩🇰", requiresAddress: true },
  // Amérique
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$", flag: "🇺🇸", requiresAddress: true },
  { code: "CA", name: "Canada", currency: "CAD", currencySymbol: "CA$", flag: "🇨🇦", requiresAddress: true },
  { code: "BR", name: "Brésil", currency: "BRL", currencySymbol: "R$", flag: "🇧🇷", requiresAddress: true },
  // Asie / Moyen-Orient
  { code: "AE", name: "Émirats Arabes Unis", currency: "AED", currencySymbol: "AED", flag: "🇦🇪", requiresAddress: true },
  { code: "SA", name: "Arabie Saoudite", currency: "SAR", currencySymbol: "SAR", flag: "🇸🇦", requiresAddress: true },
  { code: "TR", name: "Turquie", currency: "TRY", currencySymbol: "₺", flag: "🇹🇷", requiresAddress: true },
  { code: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥", flag: "🇯🇵", requiresAddress: true },
  { code: "CN", name: "China", currency: "CNY", currencySymbol: "¥", flag: "🇨🇳", requiresAddress: true },
  // Océanie
  { code: "AU", name: "Australia", currency: "AUD", currencySymbol: "A$", flag: "🇦🇺", requiresAddress: true },
];
