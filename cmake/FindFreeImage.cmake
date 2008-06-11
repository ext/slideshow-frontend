#
# Try to find FREEIMAGE library and include path.
# Once done this will define
#
# FREEIMAGE_FOUND
# FREEIMAGE_INCLUDE_PATH
# FREEIMAGE_LIBRARY
#

IF ( NOT FREEIMAGE_FIND_QUIETLY )
	MESSAGE ( STATUS "Looking for FreeImage" )
ENDIF ( NOT FREEIMAGE_FIND_QUIETLY )

IF (WIN32)
	MESSAGE(FATAL_ERROR "bajs")
ELSE (WIN32)
	FIND_PATH( FREEIMAGE_INCLUDE_PATH FreeImage.h
		/usr/local/include
		/usr/include
		/sw/include
		/opt/local/include
		/opt/csw/include
		/opt/include
	)

	FIND_LIBRARY( FREEIMAGE_LIBRARY freeimage
		/usr/lib64
		/usr/lib
		/usr/local/lib64
		/usr/local/lib
		/sw/lib
		/opt/local/lib
		DOC "The FreeImage library")
ENDIF (WIN32)

IF (FREEIMAGE_INCLUDE_PATH)
	SET( FREEIMAGE_FOUND TRUE )
ELSE (FREEIMAGE_INCLUDE_PATH)
	SET( FREEIMAGE_FOUND FALSE )
ENDIF (FREEIMAGE_INCLUDE_PATH)

IF ( FREEIMAGE_FOUND )
   IF ( NOT FREEIMAGE_FIND_QUIETLY )
	  MESSAGE ( STATUS "Looking for FreeImage - found" )
   ENDIF ( NOT FREEIMAGE_FIND_QUIETLY )
ELSE ( FREEIMAGE_FOUND )
   IF ( FREEIMAGE_FIND_REQUIRED )
	  MESSAGE ( FATAL_ERROR "Looking for FreeImage - not found" )
   ENDIF ( FREEIMAGE_FIND_REQUIRED )
ENDIF ( FREEIMAGE_FOUND )

MARK_AS_ADVANCED( FREEIMAGE_FOUND FREEIMAGE_INCLUDE_PATH FREEIMAGE_LIBRARY )
