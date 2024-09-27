import { Environment, Node, Package, Program, PROGRAM_FILE_EXTENSION, WOLLOK_FILE_EXTENSION } from 'wollok-ts'
import { VALID_IMAGE_EXTENSIONS, VALID_SOUND_EXTENSIONS } from './utils'

const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, PROGRAM_FILE_EXTENSION]

export interface File {
  name: string
  content: Buffer
}

// TODO: Move to Wollok-TS
export interface SourceFile {
  name: string;
  content: string;
}

export interface MediaFile {
  possiblePaths: string[];
  url: string;
}
export interface GameProject {
  main: string;
  sources?: SourceFile[];
  description: string;
  images: MediaFile[];
  sounds: MediaFile[];
}

export class MultiProgramException extends Error {

  wpgmFiles: Array<File | SourceFile> = []
  files: Array<File> = []

  constructor(msg: string, programs: Array<File | SourceFile>, files: Array<File>) {
    super(msg)
    this.wpgmFiles = programs
    this.files = files
  }

}

export class NoProgramException extends Error { }

export const getProgramIn = (packageFQN: string, environment: Environment): Node => {
  const programWollokFile = environment.getNodeByFQN<Package>(packageFQN)
  const wollokProgram = programWollokFile.members.find(entity => entity.is(Program))
  if (!wollokProgram) throw new NoProgramException('Program not found')
  return wollokProgram
}

export const buildGameProject = (allFiles: File[], programName?: string): GameProject => {
  const wollokFiles = allFiles.filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(normalizeWollokFile)
  let wpgmFiles: Array<File | SourceFile> = []
  let wpgmFile

  if(programName)
    wpgmFile = wollokFiles.find(file => file.name === programName)
  else
    wpgmFiles = wollokFiles.filter(withExtension(PROGRAM_FILE_EXTENSION))
  if (wpgmFiles.length > 1) throw new MultiProgramException('This project has more than one program', wpgmFiles, allFiles)
  if (wpgmFiles.length === 1) wpgmFile = wpgmFiles[0]
  if (!wpgmFile) throw new NoProgramException('Program file not found')
  const main = wpgmFile.name.replace(`.${PROGRAM_FILE_EXTENSION}`, '').replace(/\//gi, '.')
  const description = allFiles.find(isREADME())?.content.toString('utf8') || '## No description found'
  const images = getMediaFiles(allFiles, VALID_IMAGE_EXTENSIONS, 'image/png')
  const sounds = getMediaFiles(allFiles, VALID_SOUND_EXTENSIONS, 'audio/mp3')

  return { main, sources: wollokFiles, description, images, sounds }
}

function getMediaFiles(allFiles: File[], validExtensions: string[], type: string): MediaFile[] {
  const mediaFiles = filesWithExtension(allFiles, validExtensions)
  const mediaSourcePaths = allFiles.map(f => f.name)
  return mediaFiles.map(({ name, content }) => (
    {
      possiblePaths: possiblePathsToFile(name, mediaSourcePaths),
      url: URL.createObjectURL(new Blob([content], { type: type })),
    }
  ))
}

export function filesWithExtension(files: File[], validExtensions: string[]): File[] {
  return files.filter(withExtension(...validExtensions))
}

function possiblePathsToFile(filePath: string, sourcePaths: string[]): string[] {
  const possibleSources: string[] = sourcePaths.filter((source: string) => filePath.startsWith(source))!
  return possibleSources.map((sourcePath: string) => filePath.substring(sourcePath.length))
}

const isREADME = () => ({ name }: File | SourceFile) => name.endsWith('README.md')

const withExtension = (...extensions: string[]) => ({ name }: File | SourceFile) =>
  extensions.some(extension => name.endsWith(`.${extension}`))

/**
 * Workaroud for:
 * https://github.com/uqbar-project/wollok-ts/issues/72
 * https://github.com/uqbar-project/wollok-language/issues/31
 */
const normalizeWollokFile = ({ name, content }: File) => ({
  name: name.replace('game.wpgm', '_juego_.wpgm'),
  content: content.toString('utf8').replace(/\+\+/g, '+=1').replace(/--/g, '-=1').replace('program game', 'program _juego_'),
})