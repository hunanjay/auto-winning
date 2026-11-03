import { Context, Service } from '@deepseek-ai/cordis';
import { spawn, exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DshTracerService } from './dsh-tracer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface JianyingExportInput {
  draftName?: string;
  videoPath: string;
  width: number;
  height: number;
  fps?: number;
  openApp?: boolean;
  clips: Array<{
    id: string;
    title: string;
    startSeconds: number;
    durationSeconds: number;
    caption?: string;
    hook?: string;
    productName?: string;
    tag?: string;
  }>;
  sentences?: Array<{
    begin_time: number;
    end_time: number;
    text: string;
  }>;
}

export interface JianyingExportOutput {
  code: number;
  draftName: string;
  draftPath: string;
  clipsCount: number;
  durationSeconds: number;
  tracks: number;
  appLaunched?: boolean;
  traceId?: string;
}

export async function launchJianyingApp(): Promise<boolean> {
  return new Promise((resolve) => {
    let cmd = '';
    if (process.platform === 'darwin') {
      // 优先通过 AppleScript 激活置顶剪映，如果应用未启动则通过 open 启动并置顶
      cmd = `osascript -e 'tell application id "com.lemon.lvpro" to activate' 2>/dev/null || open -b com.lemon.lvpro || open -a "/Applications/VideoFusion-macOS.app"`;
    } else if (process.platform === 'win32') {
      cmd = `start "" "JianyingPro.exe"`;
    }

    if (!cmd) {
      return resolve(false);
    }

    exec(cmd, (err) => {
      if (err) {
        console.warn('[DSH Jianying] 唤起剪映客户端失败:', err.message);
        resolve(false);
      } else {
        console.log('[DSH Jianying] 成功唤起并置顶剪映客户端');
        resolve(true);
      }
    });
  });
}

export class DshJianyingService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'jianying');
  }

  async launchApp(): Promise<boolean> {
    return launchJianyingApp();
  }

  async exportDraft(input: JianyingExportInput, jobId?: string): Promise<JianyingExportOutput> {
    const tracer = (this.ctx as any).tracer as DshTracerService | undefined;
    const startMs = Date.now();
    const action = 'jianying.export_draft';

    const scriptPath = path.resolve(__dirname, '../../scripts/export_jianying.py');

    return new Promise((resolve, reject) => {
      const child = spawn('python3', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', async (code) => {
        const latencyMs = Date.now() - startMs;
        if (code !== 0) {
          const err = new Error(stderr || stdout || `Jianying exporter failed with exit code ${code}`);
          if (tracer) {
            tracer.record({
              traceId: `tr-jy-${Date.now()}`,
              plugin: 'dsh:jianying',
              action,
              model: 'pyJianYingDraft:engine',
              messages: [{
                role: 'user',
                content: `Export ${input.clips.length} clips of ${path.basename(input.videoPath)} to Jianying draft: ${input.draftName || 'AutoDraft'}`
              }],
              error: err.message,
              latencyMs,
              status: 'failed',
              jobId,
              createdAt: Date.now()
            });
          }
          reject(err);
          return;
        }

        try {
          const res = JSON.parse(stdout);
          const traceId = `tr-jy-${Date.now()}`;

          // 若开启 openApp（默认开启），在导出成功后自动激活置顶剪映客户端
          let appLaunched = false;
          if (input.openApp !== false) {
            appLaunched = await launchJianyingApp();
          }

          if (tracer) {
            tracer.record({
              traceId,
              plugin: 'dsh:jianying',
              action,
              model: 'pyJianYingDraft:engine',
              messages: [{
                role: 'user',
                content: `Export ${input.clips.length} clips of ${path.basename(input.videoPath)} to Jianying draft: ${res.draftName} (Auto-launched app: ${appLaunched})`
              }],
              rawOutput: JSON.stringify({ ...res, appLaunched }, null, 2),
              latencyMs,
              status: 'success',
              jobId,
              createdAt: Date.now()
            });
          }
          resolve({ ...res, appLaunched, traceId });
        } catch (e: any) {
          reject(new Error(`Failed to parse exporter output: ${stdout}`));
        }
      });

      child.stdin.write(JSON.stringify(input));
      child.stdin.end();
    });
  }
}
