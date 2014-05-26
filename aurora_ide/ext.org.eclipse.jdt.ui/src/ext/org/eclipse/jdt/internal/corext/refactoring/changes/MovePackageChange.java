/*******************************************************************************
 * Copyright (c) 2000, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package ext.org.eclipse.jdt.internal.corext.refactoring.changes;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.OperationCanceledException;

import org.eclipse.ltk.core.refactoring.Change;

import org.eclipse.jdt.core.IPackageFragment;
import org.eclipse.jdt.core.IPackageFragmentRoot;
import org.eclipse.jdt.core.JavaModelException;
import org.eclipse.jdt.ui.JavaElementLabels;


import ext.org.eclipse.jdt.internal.corext.refactoring.RefactoringCoreMessages;
import ext.org.eclipse.jdt.internal.corext.util.Messages;

public class MovePackageChange extends PackageReorgChange {

	public MovePackageChange(IPackageFragment pack, IPackageFragmentRoot dest){
		super(pack, dest, null);
	}

	@Override
	protected Change doPerformReorg(IProgressMonitor pm) throws JavaModelException, OperationCanceledException {
		getPackage().move(getDestination(), null, getNewName(), true, pm);
		return null;
	}

	@Override
	public String getName() {
		String packageName= JavaElementLabels.getElementLabel(getPackage(), JavaElementLabels.ALL_DEFAULT);
		String destinationName= JavaElementLabels.getElementLabel(getDestination(), JavaElementLabels.ALL_DEFAULT);
		return Messages.format(RefactoringCoreMessages.MovePackageChange_move, new String[] {packageName, destinationName });
	}
}
