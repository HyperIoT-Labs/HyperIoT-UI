export interface MlAlgorithmsChoiceModel {
  value: string
  label: string
  checked?: boolean
}
export interface MlAlgorithmsModel {
  algorithmConfigName: string
  algorithmConfig: MLAlgorithmConfig[]
}

export interface MLAlgorithmConfig {
  type: string
  choices?: MlAlgorithmsChoiceModel[]
  min?: number
  max?: number
  default?: number
  steps?: number
  label: string
}
