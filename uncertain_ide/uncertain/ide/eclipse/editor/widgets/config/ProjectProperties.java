/**
 * 
 */
package uncertain.ide.eclipse.editor.widgets.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IFileEditorInput;
import org.eclipse.ui.PlatformUI;

import uncertain.ide.eclipse.editor.widgets.CustomDialog;
import uncertain.ide.util.Common;

/**
 * @author linjinxiao
 * 
 */
public class ProjectProperties {
	public static String propertyFileName = "AuroraProject.properties";
	public static final String web_base_dir = "web_base_dir";
	public static final String bm_base_dir = "bm_base_dir";

	public static String getWebBaseDir(IProject project) throws Exception {
		String propertyValue = getPropertyValue(project,
				ProjectProperties.web_base_dir);
		if (propertyValue == null) {
			propertyValue = WebDirDialog.getWebBaseDir(project);
			if (propertyValue == null)
				return null;
			setPropertyValue(project, ProjectProperties.web_base_dir,
					propertyValue);
		}
		propertyValue = getProjectFileLocalPath(propertyValue);
		return propertyValue;
	}

	/**
	 * @param project
	 * @return
	 * @throws Exception
	 */
	public static String getBMBaseDir(IProject project) throws Exception {
		String propertyValue = getPropertyValue(project,
				ProjectProperties.bm_base_dir);
		if (propertyValue == null) {
			propertyValue = WebDirDialog.getBMBaseDir(project);
			if (propertyValue == null)
				return null;
			setPropertyValue(project, ProjectProperties.bm_base_dir,
					propertyValue);
		}
		propertyValue = getProjectFileLocalPath(propertyValue);
		return propertyValue;
	}

	public static String getWebBaseDir() throws Exception {
		IEditorInput input = PlatformUI.getWorkbench()
				.getActiveWorkbenchWindow().getActivePage().getActiveEditor()
				.getEditorInput();
		IFile ifile = ((IFileEditorInput) input).getFile();
		IProject project = ifile.getProject();
		return getWebBaseDir(project);
	}

	public static String getBMBaseDir() throws Exception {
		IEditorInput input = PlatformUI.getWorkbench()
				.getActiveWorkbenchWindow().getActivePage().getActiveEditor()
				.getEditorInput();
		IFile ifile = ((IFileEditorInput) input).getFile();
		IProject project = ifile.getProject();
		return getBMBaseDir(project);
	}

	public static IProject getProject() {
		IEditorInput input = PlatformUI.getWorkbench()
				.getActiveWorkbenchWindow().getActivePage().getActiveEditor()
				.getEditorInput();
		IFile ifile = ((IFileEditorInput) input).getFile();
		IProject project = ifile.getProject();
		return project;
	}

	private static String getPropertyValue(IProject project, String propertyName)
			throws Exception {
		IFile file = project.getFile(ProjectProperties.propertyFileName);
		if (!file.exists()) {
			createProjectFile(project);
		}
		String fileFullPath = Common.getIfileLocalPath(file);
		File root = new File(fileFullPath);
		Properties props = new Properties();
		props.load(new FileInputStream(root));
		Object propertyValue = props.get(propertyName);
		if (propertyValue == null)
			return null;
		return (String) propertyValue;

	}

	private static boolean createProjectFile(IProject project)
			throws CoreException {
		IFile file = project.getFile(ProjectProperties.propertyFileName);
		String fileFullPath = Common.getIfileLocalPath(file);
		File root = new File(fileFullPath);
		if (!root.exists()) {
			try {
				if (root.createNewFile()) {
					project.refreshLocal(IResource.DEPTH_ONE, null);
					return true;
				}

			} catch (IOException e) {
				CustomDialog.showExceptionMessageBox(e);
			}
		}
		return false;
	}

	private static void setPropertyValue(IProject project, String propertyName,
			String propertyValue) throws Exception {
		IFile file = project.getFile(ProjectProperties.propertyFileName);
		if (!file.exists()) {
			createProjectFile(project);
		}
		// should call 'close' method of inputStream and outputSteam,and call
		// 'refreshLocal' method of ifile.
		String fileFullPath = Common.getIfileLocalPath(file);
		File root = new File(fileFullPath);
		Properties props = new Properties();
		InputStream in = new FileInputStream(root);
		props.load(in);
		in.close();
		props.setProperty(propertyName, propertyValue);
		OutputStream out = new FileOutputStream(root);
		props.store(out, "aurora project properties");
		out.close();
		file.refreshLocal(IResource.DEPTH_ONE, null);
	}

	public static String getProjectFileLocalPath(String filePath) {
		String fileSeparator = File.separator;
		IPath ip = new Path(filePath);
		String projectName = ip.segment(0);
		String newFilePath = fileSeparator;
		for (int i = 1; i < ip.segmentCount(); i++) {
			newFilePath = newFilePath +ip.segment(i)+fileSeparator;
		}
		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(
				projectName);
		IResource resource = project;
		if (!newFilePath.equals(fileSeparator)) {
			resource = project.getFile(newFilePath);
		}
		String path = resource.getLocation().toOSString();
		return path;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {

	}
}
