import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from './logger.js';

const TELEGRAM_FILE = join(process.cwd(), '.telegram-config.json');

interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

function loadConfig(): TelegramConfig {
  try {
    const parsed = JSON.parse(readFileSync(TELEGRAM_FILE, 'utf8')) as Partial<TelegramConfig>;
    return {
      botToken: typeof parsed.botToken === 'string' ? parsed.botToken : '',
      chatId: typeof parsed.chatId === 'string' ? parsed.chatId : '',
      enabled: parsed.enabled === true,
    };
  } catch {
    return { botToken: '', chatId: '', enabled: false };
  }
}

let config = loadConfig();

export function getTelegramStatus() {
  return {
    configured: Boolean(config.botToken && config.chatId),
    enabled: config.enabled,
    chatId: config.chatId,
  };
}

export function saveTelegramConfig(input: { botToken?: string; chatId: string; enabled: boolean }) {
  const botToken = input.botToken?.trim() || config.botToken;
  config = {
    botToken,
    chatId: input.chatId.trim(),
    enabled: input.enabled && Boolean(botToken && input.chatId.trim()),
  };
  writeFileSync(TELEGRAM_FILE, JSON.stringify(config), { encoding: 'utf8', mode: 0o600 });
  return getTelegramStatus();
}

export async function sendTelegramMessage(text: string, force = false): Promise<boolean> {
  if ((!config.enabled && !force) || !config.botToken || !config.chatId) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.chatId, text }),
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, 'Telegram notification failed');
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err }, 'Telegram notification failed');
    return false;
  }
}

export function notifyVisitor(): void {
  void sendTelegramMessage('Ping — someone visited.');
}