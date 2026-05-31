/**
 * Diccionario de descripciones de variables en español.
 * Cada entrada tiene: label (nombre corto), description (explicación).
 * Se usa en tooltips y etiquetas de la UI.
 */

export interface VarDesc {
  label: string;
  description: string;
}

const descriptions: Record<string, VarDesc> = {
  // ── Summary / Decisión ──
  avg_loss: {
    label: "avg_loss",
    description: "Pérdida media durante entrenamiento/evaluación. Valores más bajos indican mejor ajuste del modelo a los datos.",
  },
  ppl_proxy: {
    label: "ppl_proxy",
    description: "Proxy de perplejidad (perplexity) sobre validación. Versión aproximada de la perplejidad real; más bajo es mejor.",
  },
  best_val_loss: {
    label: "best_val_loss",
    description: "Mejor pérdida de validación alcanzada durante todo el entrenamiento.",
  },
  final_val_loss: {
    label: "final_val_loss",
    description: "Pérdida de validación al final del entrenamiento (último paso).",
  },
  best_val_step: {
    label: "best_val_step",
    description: "Paso de entrenamiento en el que se alcanzó la mejor pérdida de validación.",
  },
  frozen_delta_off_minus_on: {
    label: "frozen_delta_off_minus_on",
    description: "Diferencia de pérdida (off - on) con FPM congelado. Positivo = FPM ayuda, Negativo = FPM perjudica.",
  },
  loss_fpm_on: {
    label: "loss_fpm_on",
    description: "Pérdida de validación con FPM activo (congelado).",
  },
  loss_fpm_off: {
    label: "loss_fpm_off",
    description: "Pérdida de validación con FPM desactivado (ablation).",
  },
  loss_train: {
    label: "loss_train",
    description: "Pérdida durante el entrenamiento (train loss). Mide el aprendizaje en cada paso.",
  },
  loss_pre: {
    label: "loss_pre",
    description: "Pérdida antes de la actualización del modelo (pre-update loss).",
  },
  loss_post: {
    label: "loss_post",
    description: "Pérdida después de la actualización del modelo (post-update loss).",
  },

  // ── FPM Pipeline ──
  fpm_loss: {
    label: "fpm_loss",
    description: "Pérdida del módulo FPM (memoria lenta). Mide el error en la predicción de la memoria.",
  },
  fpm_utility: {
    label: "fpm_utility",
    description: "Utilidad instantánea del FPM. Positivo = la memoria ayuda a reducir la pérdida.",
  },
  utility_avg: {
    label: "utility_avg",
    description: "Utilidad media del pipeline completo de memoria. Mide cuánto aporta toda la ruta de memoria.",
  },
  fpm_replay_utility: {
    label: "fpm_replay_utility",
    description: "Utilidad del replay de memoria lenta. Cuánto se reduce la pérdida al reutilizar prototipos almacenados.",
  },
  fpm_retrieval_loss: {
    label: "fpm_retrieval_loss",
    description: "Pérdida de recuperación: distancia media entre valores recuperados y el objetivo. Bajo = mejor.",
  },
  fpm_retrieval_sim: {
    label: "fpm_retrieval_sim",
    description: "Similitud media en la recuperación. Indica cuán bien se alinean las claves de consulta con los prototipos.",
  },
  retrieval_sim_avg: {
    label: "retrieval_sim_avg",
    description: "Similitud media de recuperación (promedio sobre todo el entrenamiento).",
  },
  retrieval_loss_avg: {
    label: "retrieval_loss_avg",
    description: "Pérdida media de recuperación (promedio sobre todo el entrenamiento).",
  },
  replay_util_avg: {
    label: "replay_util_avg",
    description: "Utilidad media del replay de memoria lenta (promedio sobre todo el entrenamiento).",
  },
  write_score_avg: {
    label: "write_score_avg",
    description: "Puntuación media de escritura en memoria rápida. Mide la prioridad con que se escriben entradas.",
  },

  // ── Pipeline Counts ──
  projected: {
    label: "projected",
    description: "Entradas proyectadas a memoria por paso. Potenciales escrituras antes del filtrado.",
  },
  candidates: {
    label: "candidates",
    description: "Entradas candidatas tras aplicar criterios de utilidad y similitud.",
  },
  feed_entries: {
    label: "feed_entries",
    description: "Entradas finalmente admitidas en el feed de la memoria lenta (FPM).",
  },
  consolidated: {
    label: "consolidated",
    description: "Prototipos consolidados en la memoria lenta por paso.",
  },
  accept_rate: {
    label: "accept_rate",
    description: "Ratio de aceptación de candidatos en memoria rápida (0-1).",
  },
  cons_rate: {
    label: "cons_rate",
    description: "Ratio de consolidación: prototipos nuevos frente a descartados.",
  },
  projected_per_step: {
    label: "projected_per_step",
    description: "Número de entradas proyectadas a memoria por paso (promedio).",
  },
  admitted_per_step: {
    label: "admitted_per_step",
    description: "Entradas admitidas en el feed de memoria lenta por paso (promedio).",
  },
  admit_rate: {
    label: "admit_rate",
    description: "Ratio de admisión de candidatos (promedio).",
  },
  feed_size_avg: {
    label: "feed_size_avg",
    description: "Tamaño medio de la cola de candidatos antes de consolidar.",
  },
  consolidated_per_step: {
    label: "consolidated_per_step",
    description: "Prototipos consolidados por paso (promedio).",
  },
  cons_accept_rate: {
    label: "cons_accept_rate",
    description: "Ratio de aceptación de consolidación (promedio).",
  },

  // ── Gate / Signal ──
  gate: {
    label: "gate",
    description: "Apertura del gate de FPM (0=cerrado, 1=abierto). Controla cuánto contribuye la memoria.",
  },
  gate_mean: {
    label: "gate_mean",
    description: "Valor medio del gate. Indica la apertura promedio del FPM.",
  },
  learned_cap: {
    label: "learned_cap",
    description: "Tope máximo aprendido para el gate. Límite superior de apertura.",
  },
  desired: {
    label: "desired",
    description: "Valor deseado del gate (target que el modelo intenta alcanzar).",
  },
  policy_reward: {
    label: "policy_reward",
    description: "Recompensa de la política del gate. Refleja si el gate se está abriendo en momentos útiles.",
  },
  raw_op_rms: {
    label: "raw_op_rms",
    description: "Amplitud RMS de la salida cruda del operador FPM antes de normalizar. Escala de la delta producida.",
  },
  op_rms: {
    label: "op_rms",
    description: "Amplitud RMS de la delta de memoria después de normalizar al máximo permitido.",
  },
  gated_rms: {
    label: "gated_rms",
    description: "Amplitud RMS después del gate. Refleja cuánto contribuye realmente la memoria al estado final.",
  },
  memory_rms: {
    label: "memory_rms",
    description: "Amplitud RMS del vector de memoria ya integrado en la red (después del fusion).",
  },
  target_cosine: {
    label: "target_cosine",
    description: "Coseno entre el vector objetivo (target) y la salida del FPM. Cercano a 1 = buena alineación.",
  },
  useful_high_mse: {
    label: "useful_high_mse",
    description: "Porcentaje de pasos con error alto pero coseno positivo. Memoria útil aunque MSE sea grande.",
  },
  useful_high_mse_rate: {
    label: "useful_high_mse_rate",
    description: "Tasa de pasos con MSE alto pero coseno positivo (promedio).",
  },
  norm_mse: {
    label: "norm_mse",
    description: "Error cuadrático medio normalizado entre la salida de memoria y el objetivo.",
  },

  // ── Signal Flow ──
  retrieved_rms: {
    label: "retrieved_rms",
    description: "RMS de la delta tras recuperar y combinar prototipos. Escala de la mezcla.",
  },
  memory_component_rms: {
    label: "memory_component_rms",
    description: "RMS del componente de memoria que entra en el fusion con memoria rápida.",
  },
  gated_to_retrieved: {
    label: "gated_to_retrieved",
    description: "Proporción entre señal después del gate y señal recuperada. Indica atenuación/amplificación.",
  },
  component_to_memory: {
    label: "component_to_memory",
    description: "Proporción entre componente final y memoria total. Peso de la memoria en la mezcla.",
  },
  ce_gain_no_fpm: {
    label: "ce_gain_no_fpm",
    description: "Ganancia en cross-entropy al eliminar FPM. Positivo = FPM empeora, Negativo = FPM mejora.",
  },

  // ── Functional / Utility ──
  util: {
    label: "util",
    description: "Utilidad instantánea (delta de pérdida con/sin FPM). Positivo = FPM ayuda en este paso.",
  },
  loss_gain: {
    label: "loss_gain",
    description: "Diferencia de pérdida con/sin FPM (positivo = FPM ayuda).",
  },
  usefulness: {
    label: "usefulness",
    description: "Peso del residual funcional. Indica cuánto se usa la corrección de FPM.",
  },
  residual_rms: {
    label: "residual_rms",
    description: "Magnitud RMS del residual (diferencia entre predicción y target).",
  },
  target_rms: {
    label: "target_rms",
    description: "Magnitud RMS del vector objetivo del FPM.",
  },
  bootstrap_active: {
    label: "bootstrap_active",
    description: "Indicador de si el bootstrap (auto-aprendizaje) está activo.",
  },

  // ── Interference / Routing ──
  interference_avg: {
    label: "interference_avg",
    description: "Interferencia media entre prototipos de memoria lenta. Valores altos = prototipos redundantes.",
  },
  delta_good_minus_bad: {
    label: "delta_good_minus_bad",
    description: "Diferencia entre ganancias del gate cuando FPM ayuda vs perjudica. Positivo = gate bien calibrado.",
  },
  delta_when_fpm_pos: {
    label: "delta_when_fpm_pos",
    description: "Delta de pérdida cuando FPM es positivo (útil).",
  },
  delta_when_fpm_neg: {
    label: "delta_when_fpm_neg",
    description: "Delta de pérdida cuando FPM es negativo (perjudicial).",
  },
  gate_mean_avg: {
    label: "gate_mean_avg",
    description: "Valor medio del gate promediado sobre todo el entrenamiento.",
  },

  // ── Pre-DEQ ──
  train_loss: {
    label: "train_loss",
    description: "Pérdida de entrenamiento de la fase pre-DEQ (contextualizador).",
  },
  alpha_entity: {
    label: "alpha_entity",
    description: "Parámetro que mezcla la entidad de contexto con la señal original. Peso del contexto.",
  },
  input_rms: {
    label: "input_rms",
    description: "RMS de la señal de entrada al pre-DEQ.",
  },
  input_raw_cosine: {
    label: "input_raw_cosine",
    description: "Coseno entre la entrada cruda y la entrada con contexto.",
  },
  input_shift_rms: {
    label: "input_shift_rms",
    description: "RMS del desplazamiento (shift) aplicado a la entrada.",
  },
  mode: {
    label: "mode",
    description: "Modo de operación del pre-DEQ (contexto activado o no).",
  },

  // ── Entity Metrics ──
  entropy: {
    label: "entropy",
    description: "Entropía de la entidad. Mide la dispersión de la atención sobre entidades.",
  },
  util_std: {
    label: "util_std",
    description: "Desviación estándar de la utilidad de la entidad.",
  },
  collapse: {
    label: "collapse",
    description: "Medida de colapso de entidad. Alto = todas las entidades se comportan igual.",
  },
  top1: {
    label: "top1",
    description: "Precisión top-1 de la entidad (frecuencia con que la entidad principal es la correcta).",
  },
  readback_cosine: {
    label: "readback_cosine",
    description: "Coseno de readback: similitud entre la entidad recuperada y la original.",
  },
  delta_rms: {
    label: "delta_rms",
    description: "RMS de la delta de la entidad (cambio tras aplicar contexto).",
  },
  entity_entropy: {
    label: "entity_entropy",
    description: "Entropía de la distribución de entidades. Baja = modelo enfocado en pocas entidades.",
  },
  entity_collapse: {
    label: "entity_collapse",
    description: "Colapso de entidades. Alto = todas las entidades convergen al mismo vector.",
  },
  entity_top1: {
    label: "entity_top1",
    description: "Precisión top-1 de selección de entidad.",
  },
  entity_readback_cosine: {
    label: "entity_readback_cosine",
    description: "Coseno entre entidad leída y escrita (consistencia de memoria de entidades).",
  },
  entity_delta_rms: {
    label: "entity_delta_rms",
    description: "RMS del cambio en la entidad tras actualización.",
  },

  // ── Performance ──
  elapsed_s: {
    label: "elapsed_s",
    description: "Tiempo transcurrido en segundos desde el inicio del entrenamiento.",
  },
  steps_per_sec: {
    label: "steps_per_sec",
    description: "Velocidad de entrenamiento en pasos por segundo.",
  },

  // ── Original fields ──
  memory_utility: {
    label: "memory_utility",
    description: "Utilidad de la memoria rápida (fast memory).",
  },
  fast_utility: {
    label: "fast_utility",
    description: "Utilidad de la memoria rápida (fast memory).",
  },
  fast_retrieval_loss: {
    label: "fast_retrieval_loss",
    description: "Pérdida de recuperación de la memoria rápida.",
  },
  fused_memory_loss: {
    label: "fused_memory_loss",
    description: "Pérdida de la memoria fusionada (fast + slow).",
  },
  fast_retrieval_similarity: {
    label: "fast_retrieval_similarity",
    description: "Similitud de recuperación de la memoria rápida.",
  },
  fpm_retrieval_similarity: {
    label: "fpm_retrieval_similarity",
    description: "Similitud de recuperación del FPM.",
  },
  fast_gate_mean: {
    label: "fast_gate_mean",
    description: "Valor medio del gate de memoria rápida.",
  },
  fpm_gate_mean: {
    label: "fpm_gate_mean",
    description: "Valor medio del gate de FPM (memoria lenta).",
  },
  fpm_interference: {
    label: "fpm_interference",
    description: "Interferencia entre prototipos del FPM.",
  },
  deq_residual: {
    label: "deq_residual",
    description: "Residual del módulo DEQ (deep equilibrium).",
  },
  deq_iterations: {
    label: "deq_iterations",
    description: "Número de iteraciones del solver DEQ.",
  },
  h_rms: {
    label: "h_rms",
    description: "RMS del estado oculto (hidden state).",
  },
  grad_z_rms: {
    label: "grad_z_rms",
    description: "RMS del gradiente con respecto a z (estado DEQ).",
  },
  embed_grad_rms: {
    label: "embed_grad_rms",
    description: "RMS del gradiente de las embeddings.",
  },
  mem_write_score: {
    label: "mem_write_score",
    description: "Puntuación de escritura en memoria.",
  },
  fpm_write_score: {
    label: "fpm_write_score",
    description: "Puntuación de escritura en FPM.",
  },
  fast_entries: {
    label: "fast_entries",
    description: "Entradas en memoria rápida.",
  },
  fpm_feed: {
    label: "fpm_feed",
    description: "Entradas en el feed del FPM.",
  },
  fpm_proto: {
    label: "fpm_proto",
    description: "Prototipos en el FPM.",
  },
  fast_usage: {
    label: "fast_usage",
    description: "Uso de la memoria rápida (frecuencia de acceso).",
  },
  fast_util: {
    label: "fast_util",
    description: "Utilidad de la memoria rápida.",
  },
  fast_merge: {
    label: "fast_merge",
    description: "Mezcla (merge) de memoria rápida.",
  },
  key_sim: {
    label: "key_sim",
    description: "Similitud entre claves de memoria.",
  },
  fpm_usage: {
    label: "fpm_usage",
    description: "Uso del FPM (frecuencia de acceso a memoria lenta).",
  },
  fpm_stab: {
    label: "fpm_stab",
    description: "Estabilidad del FPM (consistencia de prototipos).",
  },
  trans_cons: {
    label: "trans_cons",
    description: "Consolidación transitiva de prototipos.",
  },
  deq_loss: {
    label: "deq_loss",
    description: "Pérdida del módulo DEQ.",
  },
  state_loss: {
    label: "state_loss",
    description: "Pérdida del estado del modelo.",
  },
  mem_proj_loss: {
    label: "mem_proj_loss",
    description: "Pérdida de proyección de memoria.",
  },
  fpm_proj: {
    label: "fpm_proj",
    description: "Proyección del FPM.",
  },
  fpm_feed_count: {
    label: "fpm_feed_count",
    description: "Conteo de entradas en el feed del FPM.",
  },
  fpm_cand: {
    label: "fpm_cand",
    description: "Candidatos en el FPM.",
  },
  fpm_acc: {
    label: "fpm_acc",
    description: "Tasa de aceptación del FPM.",
  },
  fpm_cons: {
    label: "fpm_cons",
    description: "Consolidación del FPM.",
  },
  fpm_cons_rate: {
    label: "fpm_cons_rate",
    description: "Ratio de consolidación del FPM.",
  },
  fast_ws_mean: {
    label: "fast_ws_mean",
    description: "Media del write score de memoria rápida.",
  },
  feed_s_mean: {
    label: "feed_s_mean",
    description: "Media del tamaño del feed.",
  },
  fpm_tgt_rms: {
    label: "fpm_tgt_rms",
    description: "RMS del target del FPM.",
  },
  fpm_cond_rms: {
    label: "fpm_cond_rms",
    description: "RMS del conditioning del FPM.",
  },
  fpm_raw_op_rms: {
    label: "fpm_raw_op_rms",
    description: "RMS del operador crudo del FPM.",
  },
  fpm_op_rms: {
    label: "fpm_op_rms",
    description: "RMS del operador del FPM (normalizado).",
  },

  // ── Config fields ──
  block_len: {
    label: "K (block_len)",
    description: "Longitud del bloque de contexto (K). Número de tokens que el modelo procesa como una unidad.",
  },
  d: {
    label: "D",
    description: "Dimensión del espacio latente del modelo. Tamaño de los vectores de estado.",
  },
  slots: {
    label: "Slots",
    description: "Número de slots de memoria. Cada slot puede almacenar un prototipo o entidad.",
  },
  d_per_slot: {
    label: "D/slot",
    description: "Dimensión por slot de memoria. D / slots. Indica la granularidad de la representación por slot.",
  },
  k_per_slot: {
    label: "K/slot",
    description: "Longitud de bloque por slot. K / slots. Indica cuántos tokens de contexto corresponden a cada slot.",
  },
  std_loss: {
    label: "std_loss",
    description: "Desviación estándar de avg_loss entre distintas semillas (seeds) para una misma configuración. Mide la variabilidad del resultado.",
  },
};

export function getVarDesc(key: string): VarDesc {
  return descriptions[key] ?? { label: key, description: "Sin descripción disponible." };
}

export function getVarDescription(key: string): string {
  return getVarDesc(key).description;
}

export default descriptions;
