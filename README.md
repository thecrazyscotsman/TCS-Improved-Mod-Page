# TCS Improved Mod Page
 Various improvements to the Civilization 7 Mod page.

## Description
Various improvements to the Mod page. This includes:
* Separating official and fan content into different scrollable lists
* Show hidden and locked content
* Reducing wasted space
* Added support for several custom Properties
* Added iconography to aid in status readability

## Installation
Extract to your Mods folder.
* **Windows:** %localappdata%\Firaxis Games\Sid Meier's Civilization VII\Mods
* **MacOS:** ~/Library/Application Support/Civilization VII/Mods
* **Linux:** ~/My Games/Sid Meier's Civilization VII/Mods/
* **Steam Deck:** ~/My Games/Sid Meier's Civilization VII/Mods/
Mods are enabled by default after installation.

**Note:** Please ensure mods are not nested inside an extra folder after extracting - if they are they will not work!

## Custom Properties
To support custom Properties simply add them to the Properties tag within your .modinfo file. The following custom Properties are currently supported:
* SpecialThanks
* Version
* Compatibility
* URL
 * **Note:** this property can be clicked on in the Mod screen to copy the URL to your clipboard.

Here is an example:
```
<Properties>
  <Name>LOC_MOD_TCS_IMPROVED_MOD_PAGE_NAME</Name>
  <Description>LOC_MOD_TCS_IMPROVED_MOD_PAGE_DESCRIPTION</Description>
  <Authors>LOC_MOD_TCS_IMPROVED_MOD_PAGE_AUTHORS</Authors>
  <SpecialThanks>LOC_MOD_TCS_IMPROVED_MOD_PAGE_THANKS</SpecialThanks>
  <Compatibility>LOC_MOD_TCS_IMPROVED_MOD_PAGE_COMPATIBILITY</Compatibility>
  <URL>LOC_MOD_TCS_IMPROVED_MOD_PAGE_URL</URL>
  <Package>Mod</Package>
  <AffectsSavedGames>0</AffectsSavedGames>
  <Version>2</Version>
</Properties>
```
## Screenshots
### With Mod
![image](https://github.com/user-attachments/assets/a66f6794-9393-4ae6-9702-1c167ee6c393)
### Without Mod 
![1741207088663](https://github.com/user-attachments/assets/969955f5-f36b-4402-bbcb-e78d0eaba26d)
