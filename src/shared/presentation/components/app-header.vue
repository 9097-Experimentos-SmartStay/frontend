<template>
  <header class="app-header">
    <div class="app-header__bar">
      <button
          v-if="sections.length"
          ref="drawerToggle"
          type="button"
          class="app-header__icon-button app-header__toggle"
          :aria-label="t('nav.openMenu')"
          :aria-expanded="drawerOpen ? 'true' : 'false'"
          aria-controls="app-nav-drawer"
          @click="drawerOpen = true"
      >
        <i class="pi pi-bars" aria-hidden="true"></i>
      </button>

      <RouterLink :to="{ name: homeRoute }" class="app-header__brand" :aria-label="t('nav.goHome')">
        <span class="app-header__logo" aria-hidden="true"><i class="pi pi-building"></i></span>
        <span class="app-header__brand-text">
          <span class="app-header__brand-name">SmartStay</span>
          <span v-if="roleLabel" class="app-header__brand-role">{{ roleLabel }}</span>
        </span>
      </RouterLink>

      <nav class="app-header__nav" :aria-label="t('nav.main')">
        <ul class="app-header__nav-list">
          <li v-for="item in navItems" :key="item.route">
            <RouterLink
                :to="{ name: item.route }"
                class="app-header__link"
                :class="{ 'is-active': item.route === activeRoute }"
                :aria-current="item.route === activeRoute ? 'page' : undefined"
            >{{ t(item.labelKey) }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="app-header__actions">
        <LanguageSwitcher class="app-header__language" />

        <button
            type="button"
            class="app-header__user"
            :aria-label="t('nav.userMenu', { name: user?.displayName ?? '' })"
            aria-haspopup="menu"
            aria-controls="app-user-menu"
            :aria-expanded="userMenuOpen ? 'true' : 'false'"
            @click="userMenu.toggle($event)"
        >
          <pv-avatar :label="user?.initials" shape="circle" class="app-header__avatar" aria-hidden="true" />
          <span class="app-header__user-name">{{ user?.displayName }}</span>
          <i class="pi pi-angle-down app-header__user-caret" aria-hidden="true"></i>
        </button>
        <pv-menu
            id="app-user-menu"
            ref="userMenu"
            :model="userMenuItems"
            popup
            @show="userMenuOpen = true"
            @hide="userMenuOpen = false"
        >
          <template #start>
            <div class="app-header__menu-identity">
              <span class="app-header__menu-name">{{ user?.displayName }}</span>
              <span class="app-header__menu-email">{{ user?.email }}</span>
            </div>
          </template>
        </pv-menu>
      </div>
    </div>

    <pv-drawer
        id="app-nav-drawer"
        v-model:visible="drawerOpen"
        position="left"
        header="SmartStay"
        class="app-nav-drawer"
        :aria-label="t('nav.main')"
        @after-hide="restoreFocus"
    >
      <nav :aria-label="t('nav.main')">
        <ul class="app-nav-drawer__list">
          <li v-for="item in navItems" :key="item.route">
            <RouterLink
                :to="{ name: item.route }"
                class="app-nav-drawer__link"
                :class="{ 'is-active': item.route === activeRoute }"
                :aria-current="item.route === activeRoute ? 'page' : undefined"
                @click="drawerOpen = false"
            >
              <i :class="item.icon" aria-hidden="true"></i>
              <span>{{ t(item.labelKey) }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
      <div class="app-nav-drawer__language" role="group" :aria-label="t('nav.language')">
        <span class="app-nav-drawer__language-label" aria-hidden="true">{{ t('nav.language') }}</span>
        <LanguageSwitcher />
      </div>
    </pv-drawer>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '@/iam/application/iam.store.js';
import { dashboardRouteNameFor } from '@/iam/domain/user-role.js';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
import { sectionsFor } from '@/shared/presentation/navigation/area-navigation.js';

/**
 * Header of the signed-in app (guest and staff areas): brand, the sections of the role's area, language and account.
 * Mobile first: below 1280px the sections live in a drawer behind the menu button; from 1280px they sit inline.
 */

/** Keep in sync with the media queries of the style block. */
const INLINE_NAVIGATION_QUERY = '(min-width: 1280px)';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const drawerOpen = ref(false);
const drawerToggle = ref();
const userMenu = ref();
const userMenuOpen = ref(false);

const user = computed(() => iamStore.currentUser);
const roleLabel = computed(() => (iamStore.role ? t(`roles.${iamStore.role}`) : ''));
const homeRoute = computed(() => dashboardRouteNameFor(iamStore.role) ?? 'dashboard');
const sections = computed(() => sectionsFor(iamStore.area, iamStore.can));
const navItems = computed(() => [
  { route: homeRoute.value, icon: 'pi pi-home', labelKey: 'nav.home' },
  ...sections.value,
]);

/**
 * The item of the current page: the one whose path is the longest prefix of the current path, so a page inside a
 * section (/staff/rooms/new) marks its section, and /staff/rooms/map marks "Mapa" instead of "Habitaciones".
 */
const activeRoute = computed(() => {
  let best = null;
  let bestLength = -1;
  for (const item of navItems.value) {
    const path = router.resolve({ name: item.route }).path;
    const matches = route.path === path || route.path.startsWith(`${path}/`);
    if (matches && path.length > bestLength) {
      best = item.route;
      bestLength = path.length;
    }
  }
  return best;
});

const userMenuItems = computed(() => [
  { label: t('profile.title'), icon: 'pi pi-user', command: () => router.push({ name: 'profile-detail' }) },
  { separator: true },
  { label: t('auth.signOut'), icon: 'pi pi-sign-out', command: signOut },
]);

async function signOut() {
  await iamStore.signOut();
  router.push({ name: 'login' });
}

/** The drawer is a dialog: when it closes, focus goes back to the button that opened it. */
function restoreFocus() {
  drawerToggle.value?.focus();
}

watch(() => route.fullPath, () => { drawerOpen.value = false; });

// Growing the window past the breakpoint shows the inline navigation: the drawer has nothing left to do.
let inlineNavigation = null;
const closeDrawerOnInline = (event) => { if (event.matches) drawerOpen.value = false; };
onMounted(() => {
  inlineNavigation = window.matchMedia(INLINE_NAVIGATION_QUERY);
  inlineNavigation.addEventListener('change', closeDrawerOnInline);
});
onBeforeUnmount(() => inlineNavigation?.removeEventListener('change', closeDrawerOnInline));
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.app-header__bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 4rem;
  padding: 0.5rem 1rem;
  max-width: 100%;
}

.app-header__icon-button {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font-size: 1.25rem;
}

.app-header__icon-button:hover { background-color: #f1f5f9; }

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  border-radius: 0.5rem;
}

.app-header__logo {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 1.125rem;
}

.app-header__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}

.app-header__brand-name {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

.app-header__brand-role {
  font-size: 0.75rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-header__nav { display: none; }

.app-header__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: none;
}

.app-header__language { display: none; }

.app-header__user {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #1e293b;
  font: inherit;
  cursor: pointer;
}

.app-header__user:hover { background-color: #f1f5f9; }

.app-header__avatar {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.app-header__user-name,
.app-header__user-caret { display: none; }

.app-header__user-name {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.app-header__menu-identity {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.75rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  max-width: 16rem;
}

.app-header__menu-name {
  font-weight: 600;
  color: #0f172a;
}

.app-header__menu-email {
  font-size: 0.875rem;
  color: #475569;
  overflow-wrap: anywhere;
}

.app-header__icon-button:focus-visible,
.app-header__brand:focus-visible,
.app-header__link:focus-visible,
.app-header__user:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Very narrow phones: the role line would push the account button out of the bar. */
@media (max-width: 359px) {
  .app-header__brand-role { display: none; }
}

/* From 576px the language switch fits in the bar (below, it lives in the drawer). */
@media (min-width: 576px) {
  .app-header__language { display: inline-flex; }
}

@media (min-width: 768px) {
  .app-header__bar { padding: 0.5rem 1.5rem; gap: 1rem; }
}

/* Inline navigation (INLINE_NAVIGATION_QUERY). */
@media (min-width: 1280px) {
  .app-header__toggle { display: none; }

  .app-header__nav {
    display: block;
    min-width: 0;
  }

  .app-header__nav-list {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.125rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .app-header__link {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.625rem;
    border-radius: 0.5rem;
    color: #334155;
    font-size: 0.9375rem;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
  }

  .app-header__link:hover { background-color: #f1f5f9; color: #0f172a; }

  .app-header__link.is-active {
    background-color: var(--p-primary-50);
    color: var(--p-primary-700);
  }
}

@media (min-width: 1536px) {
  .app-header__bar { padding: 0.5rem 2rem; }
  .app-header__user { padding: 0.25rem 0.75rem 0.25rem 0.25rem; }
  .app-header__user-name,
  .app-header__user-caret { display: inline; }
}
</style>

<style>
/* The drawer is teleported to body: unscoped, prefixed with its own class. */
.app-nav-drawer.p-drawer { width: min(20rem, 85vw); }

.app-nav-drawer__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-nav-drawer__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: #1e293b;
  font-weight: 500;
  text-decoration: none;
}

.app-nav-drawer__link i { color: #475569; }
.app-nav-drawer__link:hover { background-color: #f1f5f9; }

.app-nav-drawer__link.is-active {
  background-color: var(--p-primary-50);
  color: var(--p-primary-700);
}

.app-nav-drawer__link.is-active i { color: var(--p-primary-700); }

.app-nav-drawer__link:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.app-nav-drawer__language {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem 0.75rem 0;
  border-top: 1px solid #e2e8f0;
}

.app-nav-drawer__language-label {
  font-weight: 500;
  color: #334155;
}

/* The bar shows the language switch from 576px. */
@media (min-width: 576px) {
  .app-nav-drawer__language { display: none; }
}
</style>
