import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export function createGitService(basePath: string) {
  const commitAndPush = async (message: string): Promise<void> => {
    try {
      await execAsync(`git add -A`, { cwd: basePath })
      await execAsync(`git commit -m "${message}"`, { cwd: basePath })
      await execAsync(`git push`, { cwd: basePath })
    } catch (error) {
      console.error('Failed to commit and push:', error)
      console.error({
        message: (error as any).message,
        code: (error as any).code,
        stdout: (error as any).stdout,
        stderr: (error as any).stderr,
      })
      throw error
    }
  }

  return { commitAndPush }
}
