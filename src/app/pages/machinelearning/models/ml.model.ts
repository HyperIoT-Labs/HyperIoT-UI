export interface MlAlgorithmsModel {
  type: string
  min?: number
  max?: number
  default?: number
  steps?: number
  label: string
  choices?: MlAlgorithmsChoiceModel[]
}

export interface MlAlgorithmsChoiceModel {
  value: string
  label: string
  checked?: boolean
}
