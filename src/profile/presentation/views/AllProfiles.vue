<template>
  <div class="all-profiles">
    <h1>All Profiles</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading profiles...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadProfiles">Retry</button>
    </div>

    <!-- Profiles List -->
    <div v-if="!loading && !error" class="profiles-container">
      <div v-if="profiles.length === 0" class="empty-state">
        <p>No profiles found</p>
        <router-link to="/profiles/create" class="btn btn-primary">
          Create First Profile
        </router-link>
      </div>

      <div v-else class="profiles-grid">
        <div
            v-for="profile in profiles"
            :key="profile.id"
            class="profile-card"
            @click="goToProfile(profile.id)"
        >
          <div class="profile-card-header">
            <div class="profile-avatar">
              {{ getInitials(profile.fullName) }}
            </div>
            <h3>{{ profile.fullName }}</h3>
          </div>

          <div class="profile-card-body">
            <div class="profile-info">
              <span class="label">Email:</span>
              <span class="value">{{ profile.email }}</span>
            </div>
            <div class="profile-info">
              <span class="label">Address:</span>
              <span class="value">{{ profile.streetAddress }}</span>
            </div>
          </div>

          <div class="profile-card-footer">
            <button class="btn btn-sm btn-primary">View Details</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <router-link to="/profiles/create" class="fab">
      <span>+</span>
    </router-link>
  </div>
</template>

<script>
import { profileStore } from '../../application/profile.store';

export default {
  name: 'AllProfiles',

  data() {
    return {
      loading: false,
      error: null
    };
  },

  computed: {
    profiles() {
      return profileStore.state.profiles;
    }
  },

  methods: {
    async loadProfiles() {
      this.loading = true;
      this.error = null;

      try {
        await profileStore.fetchAllProfiles();
      } catch (err) {
        this.error = err.message || 'Failed to load profiles';
      } finally {
        this.loading = false;
      }
    },

    goToProfile(profileId) {
      this.$router.push(`/profiles/${profileId}`);
    },

    getInitials(fullName) {
      return fullName
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    }
  },

  mounted() {
    this.loadProfiles();
  }
};
</script>

<style scoped>
.all-profiles {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #dc3545;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.profile-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.profile-card-body {
  margin-bottom: 1rem;
}

.profile-info {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.profile-info .label {
  font-weight: 600;
  color: #666;
  min-width: 70px;
}

.profile-info .value {
  color: #333;
  word-break: break-word;
}

.profile-card-footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  text-align: right;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.1);
  background: #0056b3;
}
</style>