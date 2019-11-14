'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">hyperiot documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="dependencies.html" data-type="chapter-link">
                                <span class="icon ion-ios-list"></span>Dependencies
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse" ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-ec12ea4b607b7aa592dce1abe3bf56eb"' : 'data-target="#xs-components-links-module-AppModule-ec12ea4b607b7aa592dce1abe3bf56eb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-ec12ea4b607b7aa592dce1abe3bf56eb"' :
                                            'id="xs-components-links-module-AppModule-ec12ea4b607b7aa592dce1abe3bf56eb"' }>
                                            <li class="link">
                                                <a href="components/AccountButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AccountButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeleteConfirmDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DeleteConfirmDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotFoundComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotFoundComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationbarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotificationbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SaveChangesDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SaveChangesDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TopbarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TopbarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link">AuthenticationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AuthenticationModule-1713c38f700afeaee395da085b2975a3"' : 'data-target="#xs-components-links-module-AuthenticationModule-1713c38f700afeaee395da085b2975a3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthenticationModule-1713c38f700afeaee395da085b2975a3"' :
                                            'id="xs-components-links-module-AuthenticationModule-1713c38f700afeaee395da085b2975a3"' }>
                                            <li class="link">
                                                <a href="components/AuthenticationComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthenticationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PasswordRecoveryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PasswordRecoveryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PasswordResetComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PasswordResetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegistrationComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RegistrationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserActivationComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UserActivationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/CustomMaterialModule.html" data-type="entity-link">CustomMaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link">DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' : 'data-target="#xs-components-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' :
                                            'id="xs-components-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' }>
                                            <li class="link">
                                                <a href="components/AddWidgetDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddWidgetDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfirmRecordingActionComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConfirmRecordingActionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardViewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardsListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardsListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DynamicWidgetComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DynamicWidgetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EventsLogSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventsLogSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoRecordingActionComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoRecordingActionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MyTelInputComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MyTelInputComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketSelectComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SensorValueSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SensorValueSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatsChartSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">StatsChartSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TextLabelSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TextLabelSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimeChartSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TimeChartSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WidgetSettingsDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">WidgetSettingsDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WidgetsLayoutComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">WidgetsLayoutComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' : 'data-target="#xs-injectables-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' :
                                        'id="xs-injectables-links-module-DashboardModule-c554489b8634e71fa110d006b9f95561"' }>
                                        <li class="link">
                                            <a href="injectables/DashboardConfigService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>DashboardConfigService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HytRoutingModule.html" data-type="entity-link">HytRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectsModule.html" data-type="entity-link">ProjectsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ProjectsModule-7bb6a27bf46e9021b9dfdfc9fa2f91a6"' : 'data-target="#xs-components-links-module-ProjectsModule-7bb6a27bf46e9021b9dfdfc9fa2f91a6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ProjectsModule-7bb6a27bf46e9021b9dfdfc9fa2f91a6"' :
                                            'id="xs-components-links-module-ProjectsModule-7bb6a27bf46e9021b9dfdfc9fa2f91a6"' }>
                                            <li class="link">
                                                <a href="components/AssetCategoryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AssetCategoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AssetTagComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AssetTagComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeviceFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DeviceFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeviceSelectComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DeviceSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EventMailComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventMailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GenericSummaryListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">GenericSummaryListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketEnrichmentFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketEnrichmentFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketEventsFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketEventsFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketFieldsFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketFieldsFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PacketStatisticsFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PacketStatisticsFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectCardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectDetailComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectWizardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectWizardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RuleDefinitionComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RuleDefinitionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectableTextComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SelectableTextComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatisticsStepComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">StatisticsStepComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WizardDeactivationModalComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">WizardDeactivationModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WizardOptionsModalComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">WizardOptionsModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WizardReportModalComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">WizardReportModalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/PacketSelectComponent-1.html" data-type="entity-link">PacketSelectComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/FieldMatrixConfiguration.html" data-type="entity-link">FieldMatrixConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="classes/FieldMatrixMapItem.html" data-type="entity-link">FieldMatrixMapItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/HytModal.html" data-type="entity-link">HytModal</a>
                            </li>
                            <li class="link">
                                <a href="classes/MyTel.html" data-type="entity-link">MyTel</a>
                            </li>
                            <li class="link">
                                <a href="classes/MyUrlSerializer.html" data-type="entity-link">MyUrlSerializer</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectFormEntity.html" data-type="entity-link">ProjectFormEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/SummaryList.html" data-type="entity-link">SummaryList</a>
                            </li>
                            <li class="link">
                                <a href="classes/SummaryListItem.html" data-type="entity-link">SummaryListItem</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthenticationHttpErrorHandlerService.html" data-type="entity-link">AuthenticationHttpErrorHandlerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardConfigService.html" data-type="entity-link">DashboardConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EntitiesService.html" data-type="entity-link">EntitiesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpErrorHandlerService.html" data-type="entity-link">HttpErrorHandlerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HytModalConfService.html" data-type="entity-link">HytModalConfService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PacketFieldService.html" data-type="entity-link">PacketFieldService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProjectWizardHttpErrorHandlerService.html" data-type="entity-link">ProjectWizardHttpErrorHandlerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProjectWizardService.html" data-type="entity-link">ProjectWizardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UnitConversionService.html" data-type="entity-link">UnitConversionService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/CanDeactivateGuard.html" data-type="entity-link">CanDeactivateGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/LoggedInGuard.html" data-type="entity-link">LoggedInGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/ProjectWizardCanDeactivate.html" data-type="entity-link">ProjectWizardCanDeactivate</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/DashboardWidgetPlus.html" data-type="entity-link">DashboardWidgetPlus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Entity.html" data-type="entity-link">Entity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FieldList.html" data-type="entity-link">FieldList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HYTError.html" data-type="entity-link">HYTError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HytSelectOption.html" data-type="entity-link">HytSelectOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RuleDefinition.html" data-type="entity-link">RuleDefinition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RuleForm.html" data-type="entity-link">RuleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectableText.html" data-type="entity-link">SelectableText</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WidgetClient.html" data-type="entity-link">WidgetClient</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});