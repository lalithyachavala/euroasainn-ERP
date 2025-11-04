import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { vi } from 'vitest';

/**
 * Mock Express Request object for testing
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  } as Partial<Request>;
};

/**
 * Mock Express Response object for testing
 */
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    locals: {},
  };
  return res;
};

/**
 * Create a valid MongoDB ObjectId string
 */
export const createObjectId = (): string => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Mock Redis service for testing
 */
export const mockRedisService = {
  isBlacklisted: vi.fn().mockResolvedValue(false),
  addToBlacklist: vi.fn().mockResolvedValue(undefined),
  removeFromBlacklist: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0),
};


