import { UserAccount, SavedGameState } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const USERS_KEY = 'cyber_clicker_users_v1';
const CURRENT_USER_KEY = 'cyber_clicker_active_user_v1';
const SAVE_PREFIX = 'cyber_clicker_save_v1_';

export function defaultInitialState(username: string): SavedGameState {
  return {
    username,
    points: 0,
    lifetimePoints: 0,
    itemsOwned: {},
    upgradesPurchased: [],
    achievementsUnlocked: [],
    quantumRelics: 0,
    lastSaveTime: Date.now(),
    unlockedComposers: ['comp_bach'],
    equippedComposer: 'comp_bach',
    equippedTheme: 'cyberpunk',
    cosmeticsUnlocked: [],
    stats: {
      totalClicks: 0,
      totalCriticalClicks: 0,
      lifetimePoints: 0,
      goldenDropsClicked: 0,
      prestigeCount: 0,
      timePlayedSeconds: 0,
    },
  };
}

// Simple hash utility for local authentication demo
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

export class AuthManager {
  public static getUsers(): Record<string, UserAccount> {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveUsers(users: Record<string, UserAccount>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  public static getCurrentUsername(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  public static setCurrentUsername(username: string | null): void {
    if (username) {
      localStorage.setItem(CURRENT_USER_KEY, username);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  public static register(username: string, password: string): { success: boolean; error?: string } {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username cannot be empty' };
    }
    if (cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    const users = this.getUsers();
    const normalizedKey = cleanUsername.toLowerCase();

    if (users[normalizedKey]) {
      return { success: false, error: 'Username already exists. Please login instead.' };
    }

    const newUser: UserAccount = {
      username: cleanUsername,
      passwordHash: simpleHash(password),
      createdAt: Date.now(),
      lastSaved: Date.now(),
    };

    users[normalizedKey] = newUser;
    this.saveUsers(users);
    this.setCurrentUsername(cleanUsername);

    // Initialize fresh save
    const freshSave = defaultInitialState(cleanUsername);
    this.saveGameState(freshSave);

    return { success: true };
  }

  public static login(username: string, password: string): { success: boolean; error?: string } {
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      return { success: false, error: 'Please fill in both fields' };
    }

    const users = this.getUsers();
    const normalizedKey = cleanUsername.toLowerCase();
    const user = users[normalizedKey];

    if (!user) {
      return { success: false, error: 'User not found. Check username or register.' };
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password' };
    }

    this.setCurrentUsername(user.username);
    return { success: true };
  }

  public static logout(): void {
    this.setCurrentUsername(null);
  }

  public static loadGameState(username: string): SavedGameState {
    try {
      const data = localStorage.getItem(`${SAVE_PREFIX}${username.toLowerCase()}`);
      if (data) {
        const parsed: SavedGameState = JSON.parse(data);
        // Ensure missing properties from newer schemas are initialized safely
        if (!parsed.stats) {
          parsed.stats = {
            totalClicks: 0,
            totalCriticalClicks: 0,
            lifetimePoints: parsed.lifetimePoints || 0,
            goldenDropsClicked: 0,
            prestigeCount: 0,
            timePlayedSeconds: 0,
          };
        }
        if (!parsed.itemsOwned) parsed.itemsOwned = {};
        if (!parsed.upgradesPurchased) parsed.upgradesPurchased = [];
        if (!parsed.achievementsUnlocked) parsed.achievementsUnlocked = [];
        if (parsed.quantumRelics === undefined) parsed.quantumRelics = 0;
        if (!parsed.unlockedComposers) parsed.unlockedComposers = ['comp_bach'];
        if (!parsed.equippedComposer) parsed.equippedComposer = 'comp_bach';
        if (!parsed.equippedTheme) parsed.equippedTheme = 'cyberpunk';
        return parsed;
      }
    } catch {
      // Fallback
    }
    return defaultInitialState(username);
  }

  public static async saveGameState(state: SavedGameState): Promise<boolean> {
    if (!state.username) return false;
    try {
      const updatedState: SavedGameState = {
        ...state,
        lastSaveTime: Date.now(),
      };
      
      // Save locally to localStorage
      localStorage.setItem(
        `${SAVE_PREFIX}${state.username.toLowerCase()}`,
        JSON.stringify(updatedState)
      );

      // Update last saved in user metadata
      const users = this.getUsers();
      const normalizedKey = state.username.toLowerCase();
      if (users[normalizedKey]) {
        users[normalizedKey].lastSaved = Date.now();
        this.saveUsers(users);
      }

      // Sync to Google Cloud Firestore
      const cloudSuccess = await this.saveGameStateToCloud(updatedState);
      return cloudSuccess;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  public static async saveGameStateToCloud(state: SavedGameState): Promise<boolean> {
    if (!state.username) return false;
    const savePath = `saves/${state.username.toLowerCase()}`;
    try {
      await setDoc(doc(db, 'saves', state.username.toLowerCase()), {
        username: state.username,
        points: Number(state.points) || 0,
        lifetimePoints: Number(state.lifetimePoints) || 0,
        itemsOwned: state.itemsOwned || {},
        upgradesPurchased: state.upgradesPurchased || [],
        achievementsUnlocked: state.achievementsUnlocked || [],
        quantumRelics: Number(state.quantumRelics) || 0,
        lastSaveTime: Date.now(),
        unlockedComposers: state.unlockedComposers || [],
        equippedComposer: state.equippedComposer || 'comp_bach',
        equippedTheme: state.equippedTheme || 'cyberpunk',
        cosmeticsUnlocked: state.cosmeticsUnlocked || [],
        stats: state.stats || {},
      });
      return true;
    } catch (error) {
      console.warn('Cloud save sync warning:', error);
      return false;
    }
  }

  public static async loadGameStateFromCloud(username: string): Promise<SavedGameState | null> {
    if (!username) return null;
    try {
      const docSnap = await getDoc(doc(db, 'saves', username.toLowerCase()));
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as SavedGameState;
        if (!cloudData.stats) {
          cloudData.stats = {
            totalClicks: 0,
            totalCriticalClicks: 0,
            lifetimePoints: cloudData.lifetimePoints || 0,
            goldenDropsClicked: 0,
            prestigeCount: 0,
            timePlayedSeconds: 0,
          };
        }
        if (!cloudData.itemsOwned) cloudData.itemsOwned = {};
        if (!cloudData.upgradesPurchased) cloudData.upgradesPurchased = [];
        if (!cloudData.achievementsUnlocked) cloudData.achievementsUnlocked = [];
        if (!cloudData.unlockedComposers) cloudData.unlockedComposers = ['comp_bach'];
        if (!cloudData.equippedComposer) cloudData.equippedComposer = 'comp_bach';
        return cloudData;
      }
    } catch (error) {
      console.warn('Cloud load warning:', error);
      return null;
    }
    return null;
  }

  public static async resetAllAccounts(): Promise<void> {
    try {
      const users = this.getUsers();
      for (const usernameKey of Object.keys(users)) {
        try {
          const userObj = users[usernameKey];
          if (userObj && userObj.username) {
            await deleteDoc(doc(db, 'saves', userObj.username.toLowerCase())).catch(() => {});
          }
        } catch {}
        localStorage.removeItem(`${SAVE_PREFIX}${usernameKey}`);
      }

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(SAVE_PREFIX) || key === USERS_KEY || key === CURRENT_USER_KEY)) {
          localStorage.removeItem(key);
        }
      }

      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      console.log('All accounts have been reset successfully.');
    } catch (e) {
      console.error('Error resetting all accounts:', e);
      localStorage.clear();
    }
  }
}

