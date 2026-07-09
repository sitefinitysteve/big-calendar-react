import { create } from 'zustand'
import type { Locale } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { es } from 'date-fns/locale/es'
import type { ICalendarLabels } from '@/calendar/labels'

export type TLocale = 'en' | 'fr' | 'es'

export const LOCALE_OPTIONS = [
  { value: 'en' as const, label: 'English' },
  { value: 'fr' as const, label: 'Français' },
  { value: 'es' as const, label: 'Español' },
]

const FR_LABELS: Partial<ICalendarLabels> = {
  viewDay: 'Jour',
  viewWeek: 'Semaine',
  viewMonth: 'Mois',
  viewYear: 'Année',
  viewAgenda: 'Agenda',
  viewDayTooltip: 'Afficher par jour',
  viewWeekTooltip: 'Afficher par semaine',
  viewMonthTooltip: 'Afficher par mois',
  viewYearTooltip: 'Afficher par année',
  viewAgendaTooltip: "Afficher l'agenda",

  addEvent: 'Ajouter un événement',
  userAll: 'Tous',
  userSelectPlaceholder: 'Sélectionner un utilisateur',

  eventsCount: (n: number) => `${n} événement${n !== 1 ? 's' : ''}`,
  moreEvents: (n: number) => `${n} de plus...`,
  dayOfTotal: (day: number, total: number) => `Jour ${day} sur ${total}`,

  allDay: 'Toute la journée',
  happeningNow: 'En ce moment',
  noCurrentEvents: 'Aucun rendez-vous ou consultation en ce moment',
  noEventsMonth: 'Aucun événement prévu pour le mois sélectionné',
  fieldResponsible: 'Responsable',
  fieldTitle: 'Titre',
  fieldDescription: 'Description',
  fieldColor: 'Couleur',
  fieldStartDate: 'Date de début',
  fieldStartTime: 'Heure de début',
  fieldEndDate: 'Date de fin',
  fieldEndTime: 'Heure de fin',
  fieldDate: 'Date',
  placeholderTitle: 'Entrez un titre',
  placeholderSelectOption: 'Sélectionner une option',
  placeholderSelectDate: 'Sélectionner une date',

  dialogAddTitle: 'Ajouter un événement',
  dialogEditTitle: "Modifier l'événement",
  dialogAddDescription:
    "Ce formulaire est à des fins de démonstration uniquement et ne créera pas réellement un événement. Dans une vraie application, soumettez le formulaire à l'API backend pour sauvegarder l'événement.",
  dialogEditDescription:
    "Ce formulaire met uniquement à jour l'état actuel de l'événement localement à des fins de démonstration. Dans une vraie application, soumettez ce formulaire à une API backend pour persister les changements.",
  buttonCancel: 'Annuler',
  buttonCreate: "Créer l'événement",
  buttonSave: 'Enregistrer',
  buttonEdit: 'Modifier',
  buttonDelete: 'Supprimer',

  colorBlue: 'Bleu',
  colorGreen: 'Vert',
  colorRed: 'Rouge',
  colorYellow: 'Jaune',
  colorPurple: 'Violet',
  colorOrange: 'Orange',
  colorGray: 'Gris',

  settingsBadgeVariant: 'Variante de badge',
  settingsVisibleHours: 'Heures visibles',
  settingsWorkingHours: 'Heures de travail',
  settingsAvailableViews: 'Vues disponibles',
  settingsShowUserSelect: "Afficher la sélection d'utilisateur",
  settingsCanAdd: 'Peut ajouter des événements',
  settingsCanEdit: 'Peut modifier des événements',
  settingsCanDelete: 'Peut supprimer des événements',
  badgeColored: 'Coloré',
  badgeDot: 'Point',
  badgeMixed: 'Mixte',
  selectVariant: 'Sélectionner la variante',
  from: 'De',
  to: 'À',
  closed: 'Fermé',
  apply: 'Appliquer',

  weekdaySun: 'Dim',
  weekdayMon: 'Lun',
  weekdayTue: 'Mar',
  weekdayWed: 'Mer',
  weekdayThu: 'Jeu',
  weekdayFri: 'Ven',
  weekdaySat: 'Sam',

  sunday: 'Dimanche',
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',

  validationTitleRequired: 'Le titre est requis',
  validationDescriptionRequired: 'La description est requise',
  validationStartDateRequired: 'La date de début est requise',
  validationStartTimeRequired: "L'heure de début est requise",
  validationEndDateRequired: 'La date de fin est requise',
  validationEndTimeRequired: "L'heure de fin est requise",
  validationColorRequired: 'La couleur est requise',
  validationStartAfterEnd: 'La date de début ne peut pas être après la date de fin',

  weekViewNotAvailable: "La vue hebdomadaire n'est pas disponible sur les petits appareils.",
  weekViewSwitchView: 'Veuillez passer à la vue journalière ou mensuelle.',

  visibleHoursTooltip: 'Définir la plage horaire visible pour les vues jour et semaine.',
  workingHoursTooltip: 'Configurer les heures de travail pour chaque jour de la semaine.',
}

const ES_LABELS: Partial<ICalendarLabels> = {
  viewDay: 'Día',
  viewWeek: 'Semana',
  viewMonth: 'Mes',
  viewYear: 'Año',
  viewAgenda: 'Agenda',
  viewDayTooltip: 'Ver por día',
  viewWeekTooltip: 'Ver por semana',
  viewMonthTooltip: 'Ver por mes',
  viewYearTooltip: 'Ver por año',
  viewAgendaTooltip: 'Ver agenda',

  addEvent: 'Agregar evento',
  userAll: 'Todos',
  userSelectPlaceholder: 'Seleccionar usuario',

  eventsCount: (n: number) => `${n} evento${n !== 1 ? 's' : ''}`,
  moreEvents: (n: number) => `${n} más...`,
  dayOfTotal: (day: number, total: number) => `Día ${day} de ${total}`,

  allDay: 'Todo el día',
  happeningNow: 'Ocurriendo ahora',
  noCurrentEvents: 'No hay citas o consultas en este momento',
  noEventsMonth: 'No hay eventos programados para el mes seleccionado',
  fieldResponsible: 'Responsable',
  fieldTitle: 'Título',
  fieldDescription: 'Descripción',
  fieldColor: 'Color',
  fieldStartDate: 'Fecha de inicio',
  fieldStartTime: 'Hora de inicio',
  fieldEndDate: 'Fecha de fin',
  fieldEndTime: 'Hora de fin',
  fieldDate: 'Fecha',
  placeholderTitle: 'Ingrese un título',
  placeholderSelectOption: 'Seleccionar una opción',
  placeholderSelectDate: 'Seleccionar una fecha',

  dialogAddTitle: 'Agregar nuevo evento',
  dialogEditTitle: 'Editar evento',
  dialogAddDescription:
    'Este formulario es solo para fines de demostración y no creará un evento real. En una aplicación real, envíe el formulario a la API del backend para guardar el evento.',
  dialogEditDescription:
    'Este formulario solo actualiza el estado actual del evento localmente para fines de demostración. En una aplicación real, envíe este formulario a una API del backend para persistir los cambios.',
  buttonCancel: 'Cancelar',
  buttonCreate: 'Crear evento',
  buttonSave: 'Guardar cambios',
  buttonEdit: 'Editar',
  buttonDelete: 'Eliminar',

  colorBlue: 'Azul',
  colorGreen: 'Verde',
  colorRed: 'Rojo',
  colorYellow: 'Amarillo',
  colorPurple: 'Morado',
  colorOrange: 'Naranja',
  colorGray: 'Gris',

  settingsBadgeVariant: 'Variante de insignia',
  settingsVisibleHours: 'Horas visibles',
  settingsWorkingHours: 'Horas de trabajo',
  settingsAvailableViews: 'Vistas disponibles',
  settingsShowUserSelect: 'Mostrar selección de usuario',
  settingsCanAdd: 'Puede agregar eventos',
  settingsCanEdit: 'Puede editar eventos',
  settingsCanDelete: 'Puede eliminar eventos',
  badgeColored: 'Coloreado',
  badgeDot: 'Punto',
  badgeMixed: 'Mixto',
  selectVariant: 'Seleccionar variante',
  from: 'Desde',
  to: 'Hasta',
  closed: 'Cerrado',
  apply: 'Aplicar',

  weekdaySun: 'Dom',
  weekdayMon: 'Lun',
  weekdayTue: 'Mar',
  weekdayWed: 'Mié',
  weekdayThu: 'Jue',
  weekdayFri: 'Vie',
  weekdaySat: 'Sáb',

  sunday: 'Domingo',
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',

  validationTitleRequired: 'El título es obligatorio',
  validationDescriptionRequired: 'La descripción es obligatoria',
  validationStartDateRequired: 'La fecha de inicio es obligatoria',
  validationStartTimeRequired: 'La hora de inicio es obligatoria',
  validationEndDateRequired: 'La fecha de fin es obligatoria',
  validationEndTimeRequired: 'La hora de fin es obligatoria',
  validationColorRequired: 'El color es obligatorio',
  validationStartAfterEnd: 'La fecha de inicio no puede ser posterior a la fecha de fin',

  weekViewNotAvailable: 'La vista semanal no está disponible en dispositivos pequeños.',
  weekViewSwitchView: 'Cambie a la vista diaria o mensual.',

  visibleHoursTooltip: 'Establecer el rango de tiempo visible para las vistas de día y semana.',
  workingHoursTooltip: 'Configurar las horas de trabajo para cada día de la semana.',
}

const LABEL_SETS: Record<TLocale, Partial<ICalendarLabels>> = {
  en: {},
  fr: FR_LABELS,
  es: ES_LABELS,
}

const DATE_LOCALE_MAP: Record<TLocale, Locale | undefined> = {
  en: undefined,
  fr,
  es,
}

interface LocaleState {
  locale: TLocale
  setLocale: (value: TLocale) => void
}

const initialLocale =
  ((typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null) as TLocale) ?? 'en'

const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  setLocale: (value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('locale', value)
    set({ locale: value })
  },
}))

export function useLocale() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  return {
    locale,
    setLocale,
    currentLabels: LABEL_SETS[locale],
    currentDateLocale: DATE_LOCALE_MAP[locale],
    LOCALE_OPTIONS,
  }
}
