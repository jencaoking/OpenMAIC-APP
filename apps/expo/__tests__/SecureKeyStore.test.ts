/**
 * @file SecureKeyStore.test.ts
 * @description Phase 7.5 单元测试：SecureKeyStore 密钥管理。
 */
import { SecureKeyStore } from '../../src/core/security/SecureKeyStore';
import * as SecureStore from 'expo-secure-store';

describe('SecureKeyStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAndStoreDbKey', () => {
    it('should generate a 32-byte base64-encoded key', async () => {
      const key = await SecureKeyStore.generateAndStoreDbKey();
      // base64 编码的 32 字节 = 44 字符（含 padding）
      expect(key).toMatch(/^[A-Za-z0-9+/]{43}=$/);
    });

    it('should store key in SecureStore', async () => {
      const setItemSpy = jest.spyOn(SecureStore, 'setItemAsync');
      await SecureKeyStore.generateAndStoreDbKey();
      expect(setItemSpy).toHaveBeenCalledWith(
        'openmaic_db_encryption_key',
        expect.any(String),
        expect.objectContaining({
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }),
      );
    });
  });

  describe('getOrCreateDbKey', () => {
    it('should return existing key if present', async () => {
      jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('existing-key');
      const key = await SecureKeyStore.getOrCreateDbKey();
      expect(key).toBe('existing-key');
    });

    it('should generate new key if not present', async () => {
      jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce(null);
      const key = await SecureKeyStore.getOrCreateDbKey();
      expect(key).toMatch(/^[A-Za-z0-9+/]{43}=$/);
    });
  });

  describe('set and get', () => {
    it('should round-trip a value', async () => {
      await SecureKeyStore.set('auth_token', 'my-token-123');
      jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('my-token-123');
      const value = await SecureKeyStore.get('auth_token');
      expect(value).toBe('my-token-123');
    });
  });

  describe('delete', () => {
    it('should call deleteItemAsync', async () => {
      const deleteSpy = jest.spyOn(SecureStore, 'deleteItemAsync');
      await SecureKeyStore.delete('auth_token');
      expect(deleteSpy).toHaveBeenCalledWith('openmaic_auth_token');
    });
  });

  describe('has', () => {
    it('should return true when key exists', async () => {
      jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce('value');
      const exists = await SecureKeyStore.has('api_key');
      expect(exists).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce(null);
      const exists = await SecureKeyStore.has('api_key');
      expect(exists).toBe(false);
    });
  });
});
