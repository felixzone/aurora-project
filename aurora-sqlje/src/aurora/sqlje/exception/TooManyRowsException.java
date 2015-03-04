package aurora.sqlje.exception;

public class TooManyRowsException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -9039859229935574519L;
	public TooManyRowsException() {
		super("TOO_MANY_ROWS");
	}

}
