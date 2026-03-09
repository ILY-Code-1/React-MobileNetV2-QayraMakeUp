/**
 * Health Check Handler untuk QayraMakeUp Backend
 */

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { ApiResponse } from './types';
import { formatDate } from './utils';

// Initialize Firebase Admin jika belum
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================================================
// HEALTH CHECK HANDLER
// ============================================================================

export const healthCheckHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  try {
    // Test database connection
    await db.collection('_health').doc('check').get();

    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: formatDate(),
      },
      timestamp: formatDate(),
    } as ApiResponse<{ status: string; database: string; timestamp: string }>);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      data: {
        status: 'error',
        database: 'disconnected',
        timestamp: formatDate(),
      },
      timestamp: formatDate(),
    } as ApiResponse);
  }
};
