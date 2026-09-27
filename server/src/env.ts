/** Liaisons et variables du Worker (voir wrangler.toml ; les secrets sont posés par le workflow GitHub). */
export interface Env {
  ROOMS: DurableObjectNamespace;
  QUOTA: DurableObjectNamespace;
  /** Origines autorisées, séparées par des virgules (le site GitHub Pages, le développement local). */
  ALLOWED_ORIGINS: string;
  /** Plafond global de jetons Azure délivrés par jour (garde-fou de facturation). */
  AZURE_TOKENS_PER_DAY: string;
  /** Secrets (facultatifs : sans eux, le service de jetons répond 503 et l'application s'en passe). */
  AZURE_SPEECH_KEY?: string;
  AZURE_SPEECH_REGION?: string;
}
