/**
 * @file mods-content.ts
 * @copyright 2024, Firaxis Games
 * @description Screen listing the mods with details.
 */
import FocusManager from '/core/ui/input/focus-manager.js';
import NavTray from '/core/ui/navigation-tray/model-navigation-tray.js';
import Panel from '/core/ui/panel-support.js';
import { MustGetElement } from '/core/ui/utilities/utilities-dom.js';
import ActionHandler from '/core/ui/input/action-handler.js';
import { Audio } from '/core/ui/audio-base/audio-support.js';

console.warn("----------------------------------");
console.warn("TCS IMPROVED MOD PAGE (TCS-IMP) - LOADED");
console.warn("----------------------------------");

export class ModsContent extends Panel {
    constructor(root) {
        super(root);
        this.showNotOwnedContent = true;
    
		this.allMods = Modding.getInstalledMods()
		this.officialMods = [];
		this.unofficialMods = [];
		this.allMods.forEach((mod) => {
			if (mod.handle != null) {
				if (mod.official) {
					this.officialMods.push(mod);
				}
				else {
					this.unofficialMods.push(mod);
				}
			}
		});
		this.officialMods.sort((a, b) => Locale.compare(a.name, b.name));
		this.unofficialMods.sort((a, b) => Locale.compare(a.name, b.name));
		this.installedMods = this.officialMods.concat(this.unofficialMods);
        this.officialModPairs = [];
        this.unofficialModPairs = [];
		
		// Get default mod for when the page is opened
		this.defaultMod = this.unofficialMods.find(m => m.id == "tcs-ui-improved-mod-page")
		this.selectedModIndex = -1; //set to -1 to start to keep the toggle button hidden
		this.selectedMod = this.defaultMod;
        this.selectedModHandle = this.defaultMod.handle;
		
		// Listeners
		this.onModActivateListener = this.onModActivate.bind(this);
        this.onModFocusListener = this.onModFocus.bind(this);
        this.focusListener = this.onFocus.bind(this);
        this.modToggledActivateListener = this.onModToggled.bind(this);
        this.engineInputListener = this.onEngineInput.bind(this);
        this.officialModsEnabledActivateListener = this.onEnableAllOfficialToggled.bind(this);
        this.officialModsDisabledActivateListener = this.onDisableAllOfficialToggled.bind(this);
        this.unofficialModsEnabledActivateListener = this.onEnableAllUnofficialToggled.bind(this);
        this.unofficialModsDisabledActivateListener = this.onDisableAllUnofficialToggled.bind(this);
		
    }
    ;
    onInitialize() {
        super.onInitialize();
        this.Root.innerHTML = this.getContent();
        this.mainSlot = MustGetElement(".additional-content-mods", this.Root);
        this.modNameHeader = MustGetElement('.selected-mod-name', this.Root);
		this.modAuthorText = MustGetElement('.mod-author', this.Root);
		this.modThanksText = MustGetElement('.mod-thanks', this.Root);
        this.modDateText = MustGetElement('.mod-date', this.Root);
		this.modGatedContent = MustGetElement('.mod-gated', this.Root);
		this.modGatedText = MustGetElement('.mod-gated-description', this.Root);
        this.modDescriptionText = MustGetElement('.mod-description', this.Root);
		this.modVersionText = MustGetElement('.mod-version', this.Root);
		this.modOfficialText = MustGetElement('.mod-official', this.Root);
		this.modUnofficialText = MustGetElement('.mod-unofficial', this.Root);
		this.modAffectsSaveGamesText = MustGetElement('.mod-affects-saved-game', this.Root);
		this.modId = MustGetElement('.mod-id', this.Root);
		this.modCompatibilityText = MustGetElement('.mod-compatibility', this.Root);
		this.modUrlText = MustGetElement('.mod-url', this.Root);
        this.modCivModsText = MustGetElement('.mod-civmods', this.Root);
		this.modToggle = MustGetElement('.toggle-enable', this.Root);
        //this.modDependenciesContent = MustGetElement('.mod-dependencies', this.Root);
        this.renderModListContent();
        this.modEntries = this.Root.querySelectorAll(".mod-entry");
    }
    getContent() {
        return `
			<fxs-slot id="mods" class="additional-content-mods flex-auto relative flex flex-col items-stretch">
				<div class="no-mods-available w-full flex justify-center items-center flex-auto text-lg hidden" data-l10n-id="LOC_UI_MOD_NONE_AVAILABLE"></div>
				<fxs-hslot class="mods-available w-full justify-start items-stretch flex-auto">
                    <fxs-vslot class="w-1\\/4">
                        <fxs-header filigree-style="none" 
                                        class="mod-list-official-header relative flex justify-center font-title text-2xl uppercase text-secondary mb-3"
                                        title="LOC_MOD_TCS_UI_OFFICIAL_HEADER"></fxs-header>
                        <fxs-scrollable class="mod-list-scrollable flex-auto" handle-gamepad-pan="true">    
                            <fxs-vslot class="mod-list-official flex mb-8 m-6"></fxs-vslot>
                        </fxs-scrollable>
                        <fxs-hslot class="justify-around pt-2" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}">
                            <fxs-button class="enable-all-official min-w-px" caption="LOC_MOD_TCS_UI_ENABLE_ALL"
                                                tabindex="-1"></fxs-button>
                            <fxs-button class="disable-all-official min-w-px" caption="LOC_MOD_TCS_UI_DISABLE_ALL"
                                                tabindex="-1"></fxs-button>
                        </fxs-hslot>
                    </fxs-vslot>
                    <fxs-vslot class="w-1\\/4">
                        <fxs-header filigree-style="none" 
                                        class="mod-list-unofficial-header relative flex justify-center font-title text-2xl uppercase text-secondary mb-3"
                                        title="LOC_MOD_TCS_UI_UNOFFICIAL_HEADER">
                        </fxs-header>
                        <fxs-scrollable class="mod-list-scrollable flex-auto" handle-gamepad-pan="true">
                            <fxs-vslot class="mod-list-unofficial flex mb-8 m-6"></fxs-vslot>
                        </fxs-scrollable>
                        <fxs-hslot class="justify-around pt-2" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}">
                            <fxs-button class="enable-all-unofficial min-w-px" caption="LOC_MOD_TCS_UI_ENABLE_ALL"
                                        tabindex="-1"></fxs-button>
                            <fxs-button class="disable-all-unofficial min-w-px" caption="LOC_MOD_TCS_UI_DISABLE_ALL"
                                        tabindex="-1"></fxs-button>
                        </fxs-hslot>
                    </fxs-vslot>
					<fxs-vslot class="w-1\\/2">
						<fxs-header filigree-style="none"
										class="mod-details-header relative flex justify-center font-title text-2xl uppercase text-secondary mb-3"
										title="LOC_MOD_TCS_UI_DETAILS_HEADER"></fxs-header>
						<fxs-scrollable class="mod-details-scrollable flex-auto m-6">
							<fxs-header class="selected-mod-name relative flex justify-center font-title text-xl uppercase mb-3"></fxs-header>
							<p class="mod-author relative"></p>
							<p class="mod-thanks hidden relative"></p>
							<fxs-header filigree-style="none"
										class="mod-description-header relative flex text-lg uppercase mb-1 mt-6"
										title="LOC_MOD_TCS_UI_DESCRIPTION_HEADER"></fxs-header>
							<p class="mod-description mb-6"></p>
							<fxs-vslot class="mod-gated hidden">
								<fxs-header filigree-style="none"
											class="mod-gated-header relative flex text-lg uppercase mb-1"
											title="LOC_MOD_TCS_UI_GATED_HEADER"></fxs-header>
								<p class="mod-gated-description relative mb-6"></p>
							</fxs-vslot>
							<fxs-header filigree-style="none"
										class="mod-description-header relative flex text-lg uppercase mb-1"
										title="LOC_MOD_TCS_UI_PROPERTIES_HEADER"></fxs-header>
							<fxs-hslot class="justify-between">
								<div class="relative w-2\\/2">
									<span class="mod-url hidden"></span>
									<p class="mod-version hidden"></p>
									<p class="mod-date hidden"></p>
									<p class="mod-affects-saved-game hidden"></p>
									<p class="mod-id wrap"></p>
								</div>
								<div class="relative justify-end pl-1 mr-1 w-1\\/2">
									<p class="mod-official hidden"></p>
									<p class="mod-unofficial hidden"></p>
									<p class="mod-compatibility hidden"></p>
                                    <p class="mod-civmods hidden"></p>
								</div>
							</fxs-hslot>
							
						</fxs-scrollable>
						<fxs-hslot class="justify-center items-center" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}">
							<fxs-button class="toggle-enable hidden" caption="LOC_ADVANCED_OPTIONS_ENABLE"
										tabindex="-1"></fxs-button>
						</fxs-hslot>
					</fxs-vslot>
				</fxs-hslot>
			</fxs-slot>
		`;
    }
    renderModListContent() {
        
        const modsContent = MustGetElement('.mods-available', this.Root);
        const modsContentEmpty = MustGetElement('.no-mods-available', this.Root);
        		
		modsContent.classList.toggle('hidden', this.installedMods.length == 0);
		modsContentEmpty.classList.toggle('hidden', this.installedMods.length > 0);
		
		// Initiate an index that will span both lists
		let modIndex = 0;
		
		if (this.officialMods.length > 0) {
			
			// Clear the list. It will be rebuilt when we toggle a mod
			const modList = MustGetElement('.mod-list-official', this.Root);
			while (modList.lastChild) {
				modList.lastChild.removeEventListener('action-activate', this.onModActivateListener);
				modList.lastChild.removeEventListener('focus', this.onModFocusListener);
				modList.removeChild(modList.lastChild);
			}	
			
			const toggleEnableButton = MustGetElement('.toggle-enable');
			toggleEnableButton.addEventListener("action-activate", this.modToggledActivateListener);

            const toggleEnableAllButton = MustGetElement('.enable-all-official');
			toggleEnableAllButton.addEventListener("action-activate", this.officialModsEnabledActivateListener);

            const toggleDisableAllButton = MustGetElement('.disable-all-official');
			toggleDisableAllButton.addEventListener("action-activate", this.officialModsDisabledActivateListener);
			
			// Update Selected Mods handle.
			if (this.selectedModHandle != null) {
				this.selectedModHandle = null;
			}
			
			
			// List the Mods        
            if (this.selectedModHandle == null) {
                this.selectedModHandle = this.defaultMod.handle;
            }
			
            for (const mod of this.officialMods) {
                if (Modding.getModProperty(mod.handle, "ShowInBrowser") == 0) { continue; }
                const modActivatable = document.createElement('fxs-activatable');
                modActivatable.classList.add('mod-entry', 'group', 'relative', 'flex', 'w-full', 'grow', 'm-1');
                modActivatable.classList.add(modIndex % 2 === 0 ? '' : 'bg-primary-5');
                modActivatable.setAttribute('tabindex', '-1');
                modActivatable.setAttribute('index', `${modIndex}`);
                modActivatable.setAttribute('mod-handle', mod.handle.toString());
                modActivatable.addEventListener('action-activate', this.onModActivateListener);
                modActivatable.addEventListener('focus', this.onModFocusListener);
                modList.appendChild(modActivatable);
                if (this.selectedModHandle == mod.handle) {
                    FocusManager.setFocus(modActivatable);
                }
                const modHoverOverlay = document.createElement('div');
                modHoverOverlay.classList.add('img-mod-hover-overlay', 'absolute', 'inset-0', 'opacity-0', "group-hover\\:opacity-100", "group-focus\\:opacity-100", "group-active\\:opacity-100");
                modActivatable.appendChild(modHoverOverlay);
				
                const modTextContainer = document.createElement('div');
                modTextContainer.classList.add('mod-text-container', 'relative', 'flex', 'pointer-events-none', 'w-full', 'grow', 'p-1');
                modActivatable.appendChild(modTextContainer);
				
                const modName = document.createElement('div');
                modName.classList.add('mod-text-name', 'relative', 'flex', 'grow', 'text-lg', 'max-w-76');
                modName.textContent = mod.name;
                modTextContainer.appendChild(modName);
				
                const modEnabled = document.createElement('div');
                modEnabled.classList.add('mod-text-enabled', 'relative', 'flex', 'grow', 'justify-end', 'uppercase', 'text-lg', 'font-title');
				if (mod.allowance == ModAllowance.Full) {
					if (Modding.getModProperty(mod.handle, "ShowInBrowser") == 0) {
						modEnabled.setAttribute('data-l10n-id', "LOC_MOD_TCS_UI_CORE");
					}
					else {
						modEnabled.setAttribute('data-l10n-id', mod.enabled ? "LOC_MOD_TCS_UI_ENABLED" : "LOC_MOD_TCS_UI_DISABLED");
					}
				}
				else {
					modEnabled.setAttribute('data-l10n-id', "LOC_MOD_TCS_UI_GATED");
				}
                modTextContainer.appendChild(modEnabled);
				
                this.officialModPairs.push([mod.handle, modIndex]);
				modIndex += 1;
            }
        }
		
		if (this.unofficialMods.length > 0) {
			
			// Clear the list. It will be rebuilt when we toggle a mod
			const modList = MustGetElement('.mod-list-unofficial', this.Root);
			while (modList.lastChild) {
				modList.lastChild.removeEventListener('action-activate', this.onModActivateListener);
				modList.lastChild.removeEventListener('focus', this.onModFocusListener);
				modList.removeChild(modList.lastChild);
			}		
			
			const toggleEnableButton = MustGetElement('.toggle-enable');
			toggleEnableButton.addEventListener("action-activate", this.modToggledActivateListener);

            const toggleEnableAllButton = MustGetElement('.enable-all-unofficial');
			toggleEnableAllButton.addEventListener("action-activate", this.unofficialModsEnabledActivateListener);

            const toggleDisableAllButton = MustGetElement('.disable-all-unofficial');
			toggleDisableAllButton.addEventListener("action-activate", this.unofficialModsDisabledActivateListener);
			
			// Update Selected Mods handle.
			if (this.selectedModHandle != null) {
				this.selectedModHandle = null;
			}
			
			// List the Mods        
            if (this.selectedModHandle == null) {
                this.selectedModHandle = this.defaultMod.handle;
            }
			
            for (const mod of this.unofficialMods) {
                const modActivatable = document.createElement('fxs-activatable');
                modActivatable.classList.add('mod-entry', 'group', 'relative', 'flex', 'w-full', 'grow', 'm-1');
                modActivatable.classList.add(modIndex % 2 === 0 ? '' : 'bg-primary-5');
                modActivatable.setAttribute('tabindex', '-1');
                modActivatable.setAttribute('index', `${modIndex}`);
                modActivatable.setAttribute('mod-handle', mod.handle.toString());
                modActivatable.addEventListener('action-activate', this.onModActivateListener);
                modActivatable.addEventListener('focus', this.onModFocusListener);
                modList.appendChild(modActivatable);
                if (this.selectedModHandle == mod.handle) {
                    FocusManager.setFocus(modActivatable);
                }
                const modHoverOverlay = document.createElement('div');
                modHoverOverlay.classList.add('img-mod-hover-overlay', 'absolute', 'inset-0', 'opacity-0', "group-hover\\:opacity-100", "group-focus\\:opacity-100", "group-active\\:opacity-100");
                modActivatable.appendChild(modHoverOverlay);
				
                const modTextContainer = document.createElement('div');
                modTextContainer.classList.add('mod-text-container', 'relative', 'flex', 'pointer-events-none', 'w-full', 'grow', 'p-1');
                modActivatable.appendChild(modTextContainer);
				
                const modName = document.createElement('div');
                modName.classList.add('mod-text-name', 'relative', 'flex', 'grow', 'text-lg', 'max-w-76');
                modName.textContent = mod.name;
                modTextContainer.appendChild(modName);
				
                const modEnabled = document.createElement('div');
                modEnabled.classList.add('mod-text-enabled', 'relative', 'flex', 'grow', 'justify-end', 'uppercase', 'text-lg', 'font-title');
                modEnabled.setAttribute('data-l10n-id', mod.enabled ? "LOC_MOD_TCS_UI_ENABLED" : "LOC_MOD_TCS_UI_DISABLED");
                modTextContainer.appendChild(modEnabled);
				
                this.unofficialModPairs.push([mod.handle, modIndex]);
				modIndex += 1;
            }
        }
    }
    onAttach() {
        super.onAttach();
        this.Root.addEventListener("focus", this.focusListener);
        this.Root.addEventListener("engine-input", this.engineInputListener);
        this.updateDetails(this.selectedModHandle);
    }
    onDetach() {
        super.onDetach();
        this.Root.removeEventListener("focus", this.focusListener);
        this.Root.removeEventListener("engine-input", this.engineInputListener);
    }
    onAttributeChanged(name, oldValue, newValue) {
        super.onAttributeChanged(name, oldValue, newValue);
        switch (name) {
            case "show-not-owned-content":
                if (newValue) {
                    this.showNotOwnedContent = newValue.toLowerCase() === "true";
                    this.updateModListContent();
                }
                break;
        }
    }
    updateModListContent() {
        this.renderModListContent();
        this.modEntries = this.Root.querySelectorAll(".mod-entry");
    }
    updateDetails(handle) {
        if (!handle) {
            console.error("screen-extras: showModDetails: Invalid selected mod handle!");
        }
		const modInfo = Modding.getModInfo(handle);
		/* Returns the following:
			modInfo.handle 
			modInfo.id 
			modInfo.enabled 
			modInfo.name 
			modInfo.description 
			modInfo.created 
			modInfo.allowance 
			modInfo.official 
			modInfo.source 
			modInfo.sourceFileName 
			modInfo.subscriptionId 
		*/
		
		// Hide Toggle Button for locked or hidden content
		if (Modding.getModProperty(modInfo.handle, "ShowInBrowser") == 0 || (modInfo.official && modInfo.allowance != ModAllowance.Full)) {
			this.modToggle.classList.add('hidden');
		}
		else {
			this.modToggle.classList.remove('hidden');
		}
		
		// Mod name
		this.modNameHeader.setAttribute('title', modInfo.name);
		
		// Version (hidden if not present)
		// Currently only supports a custom Version property
		const version = (Modding.getModProperty(modInfo.handle, 'CivModsVersion')) ? Modding.getModProperty(modInfo.handle, 'CivModsVersion') : Modding.getModProperty(modInfo.handle, 'Version');
        if (version) {
			this.modVersionText.classList.remove('hidden');
			this.modVersionText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_VERSION", version));
        }
		else {
			this.modVersionText.classList.add('hidden');
		}
        
		// Author
        const author = Modding.getModProperty(modInfo.handle, 'Authors');
        if (author) {
			this.modAuthorText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_AUTHOR", Locale.compose(author)));
        }
		
		// Special Thanks (hidden if not present)
        const thanks = Modding.getModProperty(modInfo.handle, 'SpecialThanks');
        if (thanks) {
			this.modThanksText.classList.remove('hidden');
			this.modThanksText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_SPECIAL_THANKS", thanks));
        }
		else {
			this.modThanksText.classList.add('hidden');
		}
		
		// Description
        this.modDescriptionText.setAttribute('data-l10n-id', modInfo.description);
		
		// Gated
		if (modInfo.allowance != ModAllowance.Full) {
			this.modGatedContent.classList.remove('hidden');
			this.modGatedText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_DLC_PACKAGE", this.getDLCPackage(modInfo)));
		}
		else {
			this.modGatedContent.classList.add('hidden');
		}
		
		// Created date
        if (modInfo.created) {
			this.modDateText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_DATE_CREATED", modInfo.created));
        }
		
		// Affects Save Games
		const affectsSaveGames = Modding.getModProperty(modInfo.handle, 'AffectsSavedGames');
		if (affectsSaveGames == 1) {
			this.modAffectsSaveGamesText.classList.remove('hidden');
			this.modAffectsSaveGamesText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_AFFECTS_SAVE_GAMES"));
        }
		else {
			this.modAffectsSaveGamesText.classList.add('hidden');
		}
		
		// Mod Id
		if (modInfo.id) {
			this.modId.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_MOD_ID", modInfo.id));
        }
		
		// Official content?
		if (modInfo.official) {
			this.modUnofficialText.classList.add('hidden');
			this.modOfficialText.classList.remove('hidden');
			this.modOfficialText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_OFFICIAL"));
        }
		else {
			this.modOfficialText.classList.add('hidden');
			this.modUnofficialText.classList.remove('hidden');
			this.modUnofficialText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_UNOFFICIAL"));
		}
		
		// Compatibility
		const compatibility = Modding.getModProperty(modInfo.handle, 'Compatibility');
        if (compatibility) {
			this.modCompatibilityText.classList.remove('hidden');
			this.modCompatibilityText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_COMPATIBILITY", compatibility));
        }
		else {
			this.modCompatibilityText.classList.add('hidden');
		}

        // CivMods
        if (Modding.getModProperty(modInfo.handle, 'CivModsVersion') || Modding.getModProperty(modInfo.handle, 'CivModsURL')) {
			this.modCivModsText.classList.remove('hidden');
			this.modCivModsText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_CIVMODS_MANAGED"));
        }
		else {
			this.modCivModsText.classList.add('hidden');
		}
		
		// URL
		const modUrl = (Modding.getModProperty(modInfo.handle, 'URL')) ? Modding.getModProperty(modInfo.handle, 'URL') : Modding.getModProperty(modInfo.handle, 'CivModsURL');
        if (modUrl) {
			this.modUrlText.classList.remove('hidden');
			this.modUrlText.setAttribute('data-l10n-id', Locale.stylize("LOC_MOD_TCS_UI_MOD_URL"));
			this.modUrlText.setAttribute('data-tooltip-content', Locale.compose("LOC_MOD_TCS_UI_MOD_URL_TOOLTIP"));
			this.modUrlText.addEventListener('click', () => {
				UI.setClipboardText(Locale.compose(modUrl));
				this.modUrlText.removeAttribute('data-tooltip-content');
				this.modUrlText.setAttribute('data-tooltip-content', Locale.compose("LOC_MOD_TCS_UI_MOD_URL_TOOLTIP_COPIED"));
            });
            this.modUrlText.addEventListener('click', (e) => {
                if (e.type == 'contextmenu') {
                    this.modUrlText.removeAttribute('data-tooltip-content');
                    this.modUrlText.setAttribute('data-tooltip-content', Locale.compose("You right-clicked! Go you!"));
                }
            });
        }
		else {
			this.modUrlText.classList.add('hidden');
		}
		
		
		
		// Dependencies - nothing to hook into right now
		/*if (this.selectedMod.dependsOn) {
			const dependencyList = MustGetElement('.dependency-list', this.Root);
            this.modDependenciesContent.classList.remove('hidden');
            this.selectedMod.dependsOn.forEach(dependecy => {
                const dependencyEntry = document.createElement('div');
                dependencyEntry.classList.add("mod-dependency", "relative");
                dependencyEntry.setAttribute('data-l10n-id', dependecy.title);
                dependencyList.appendChild(dependencyEntry);
            });
        }*/
        this.determineEnableButtonState();
    }
    determineEnableButtonState() {
        if (this.selectedModHandle == null) {
            return;
        }
        //const toggleEnableButton = MustGetElement('.toggle-enable');
        // Get mod info to determine the new enabled state
		if (this.selectedModIndex == -1) {
			this.modToggle.classList.add('hidden');
		}
        const modHandles = [this.selectedModHandle];
        let allowed = false;
        if (this.selectedMod.enabled) {
            const canDisableModResult = Modding.canDisableMods(modHandles);
            allowed = canDisableModResult.status == 0;
        }
        else {
            const canEnableModResult = Modding.canEnableMods(modHandles, true);
            allowed = canEnableModResult.status == 0;
        }
        this.modToggle.setAttribute('disabled', allowed ? 'false' : 'true');
        this.modToggle.setAttribute('caption', this.selectedMod.enabled ? "LOC_ADVANCED_OPTIONS_DISABLE" : "LOC_ADVANCED_OPTIONS_ENABLE");
    }
    onModToggled(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleModToggle();
    }
    handleModToggle() {
        if (this.selectedModHandle == null) {
            return;
        }
        const enabled = this.selectedMod.enabled;
        const modHandles = [this.selectedModHandle];
        if (enabled && Modding.canDisableMods(modHandles).status == 0) {
            Modding.disableMods(modHandles);
        }
        else if (!enabled && Modding.canEnableMods(modHandles, true).status == 0) {
            Modding.enableMods(modHandles, true);
        }
        // While we rebuild, prevent the player from clicking the toggle enable button
        const toggleEnableButton = MustGetElement('.toggle-enable');
        toggleEnableButton.setAttribute('disabled', 'true');
		this.handleSelection(this.selectedModHandle, this.selectedModIndex);
		this.updateModEntry(this.selectedModIndex);
		this.determineEnableButtonState();
		this.updateNavTray();
    }
    onEnableAllOfficialToggled(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleAllModToggle(true, true);
    }
    onDisableAllOfficialToggled(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleAllModToggle(true, false);
    }
    onEnableAllUnofficialToggled(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleAllModToggle(false, true);
    }
    onDisableAllUnofficialToggled(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleAllModToggle(false, false);
    }
    handleAllModToggle(official, enable) {
        const currentModIndex = this.selectedModIndex;
        const currentModHandle = this.selectedModHandle;
        const currentMod = Modding.getModInfo(currentModHandle);
        const modPairs = (official == true) ? this.officialModPairs : this.unofficialModPairs;
        if (modPairs.length == 0) {
            return;
        } 

        modPairs.forEach(p => {
            const modHandle = p[0];
            const modIndex = p[1];
            const modInfo = Modding.getModInfo(modHandle);
            const enabled = modInfo.enabled;
            const modId = modInfo.id;
            let updated = false;
            if (!modInfo.official || (modInfo.official && modInfo.allowance == ModAllowance.Full)) {
                if (enable == false && modId != 'tcs-ui-improved-mod-page') {
                    if (enabled && Modding.canDisableMods([modHandle]).status == 0) {
                        Modding.disableMods([modHandle]);
                        updated = true;
                    }
                }
                else {
                    if (!enabled && Modding.canEnableMods([modHandle], true).status == 0) {
                        Modding.enableMods([modHandle], true);
                        updated = true;
                    }
                }
            }
            if (updated == true) {
                this.updateModEntry(modIndex);
                this.handleSelection(modHandle, modIndex);
                this.updateNavTray();
                
            }
        });	
        this.handleSelection(currentModHandle, currentModIndex);
    }
    updateNavTray() {
        NavTray.clear();
        NavTray.addOrUpdateGenericBack();
        if (this.selectedModHandle == null) {
            return;
        }
        const enabled = this.selectedMod.enabled;
        const modHandles = [this.selectedModHandle];
        if (enabled && Modding.canDisableMods(modHandles).status == 0) {
            NavTray.addOrUpdateAccept("LOC_ADVANCED_OPTIONS_DISABLE");
        }
        else if (!enabled && Modding.canEnableMods(modHandles, true).status == 0) {
            NavTray.addOrUpdateAccept("LOC_ADVANCED_OPTIONS_ENABLE");
        }
    }
    onFocus() {
        this.resolveFocus();
        this.updateNavTray();
    }
    onEngineInput(inputEvent) {
        if (this.handleEngineInput(inputEvent)) {
            inputEvent.stopPropagation();
            inputEvent.preventDefault();
        }
    }
    handleEngineInput(inputEvent) {
        if (inputEvent.detail.status != InputActionStatuses.FINISH) {
            return false;
        }
        return false;
    }
    resolveFocus() {
        FocusManager.setFocus(this.mainSlot);
    }
    onModActivate(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        if (ActionHandler.isGamepadActive) {
            Audio.playSound("data-audio-primary-button-press");
            this.handleModToggle();
        }
        else {
            this.handleSelection(parseInt(event.target.getAttribute('mod-handle') ?? ""), parseInt(event.target.getAttribute("index") ?? "0"));
        }
    }
    onModFocus(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        this.handleSelection(parseInt(event.target.getAttribute('mod-handle') ?? ""), parseInt(event.target.getAttribute("index") ?? "0"));
        this.updateNavTray();
    }
    handleSelection(modHandle, index) {
        this.selectedModIndex = index;
        this.selectedMod = Modding.getModInfo(modHandle);
        this.selectedModHandle = modHandle;
        this.updateDetails(this.selectedModHandle);
    }
    updateModEntry(index) {
        const modEntries = this.modEntries;
        if (!modEntries || modEntries.length == 0) { return; }
        let modEntry;
        modEntries.forEach(m => {
            if (m.getAttribute('index') == index.toString()) {
                modEntry = m; 
            }
        });

        const modHandleString = modEntry.getAttribute('mod-handle');
        if (!modHandleString) {
            return;
        }
        /*if (this.selectedModHandle == null) {
            return;
        }*/
        const modInfo = Modding.getModInfo(parseInt(modHandleString));
        const nameText = modEntry.querySelector(".mod-text-name");
        const enabledText = modEntry.querySelector(".mod-text-enabled");
        if (nameText) {
            nameText.textContent = modInfo.name;
        }
        if (enabledText) {
            enabledText.setAttribute('data-l10n-id', modInfo.enabled ? "LOC_MOD_TCS_UI_ENABLED" : "LOC_MOD_TCS_UI_DISABLED");
        }
    }
	getDLCPackage(mod) {
		const pkg = Modding.getModProperty(mod.handle, 'Package');
		if (pkg == 'Carlisle') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_CROSSROADS_CONTENT");
		}
		else if (mod.id == 'friedrich-xerxes-alt') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_DELUXE_CONTENT"); 
		}
		else if (mod.id == 'ashoka-himiko-alt') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_FOUNDERS_CONTENT"); 
		}
		else if (mod.id == 'shawnee-tecumseh') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_SHAWNEE_CONTENT");
		}
		else if (mod.id == 'napoleon') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_NAPOLEON_CONTENT");
		}
		else if (mod.id == 'napoleon-alt') {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_NAPOLEON_ALT_CONTENT");
		}
		else {
			return Locale.compose("LOC_MOD_TCS_UI_DLC_ADDITIONAL");
		}		
	}
}
Controls.define('mods-content', {
    createInstance: ModsContent,
    classNames: ['mods-content'],
    attributes: [
        {
            name: "show-not-owned-content",
            description: "should we show the not owned content (default: false)"
        }
    ],
    tabIndex: -1
});

//# sourceMappingURL=file:///core/ui/shell/mods-content/mods-content.js.map
