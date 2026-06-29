import cron from 'node-cron';
import { db } from '../db/index';
import { runSearch, type SearchRecord } from './orchestrator';

let scheduledTask: cron.ScheduledTask | null = null;

export function startScheduler() {
  if (scheduledTask) return;

  // Run daily at 6:00 AM
  scheduledTask = cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] Starting daily price check...');

    const searches = db.prepare(`
      SELECT * FROM searches WHERE is_active = 1
    `).all() as SearchRecord[];

    console.log(`[Scheduler] Found ${searches.length} active search(es)`);

    for (const search of searches) {
      try {
        console.log(`[Scheduler] Running search: ${search.name}`);
        await runSearch(search);
        console.log(`[Scheduler] Completed search: ${search.name}`);
      } catch (err) {
        console.error(`[Scheduler] Error running search ${search.name}:`, err);
      }
    }

    console.log('[Scheduler] Daily price check complete');
  });

  console.log('[Scheduler] Daily price check scheduled for 6:00 AM');
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Scheduler] Stopped');
  }
}
