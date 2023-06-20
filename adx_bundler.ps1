# This powershell script bundles an adx(adp/adc).
# No need to manually archive adxs anymore.

# NOTE:Put the adx_bundler.ps1 inside adx folder and right click->Run with powershell

# Created At 22-08-2022 By Prabath

# Get the folder-path
$realpath = Get-Location

# folder-name
$directoryname = (get-item $realpath).name

# bin dir path
$bpath = "$($realpath)\bin"

# adx file paths
$fpath = "$($realpath)\bin\$($directoryname).adc"
$fpath2 = "$($realpath)\bin\$($directoryname).adp"

# zipped file path
$zpath = "$($realpath)\bin\$($directoryname).zip"

# destination path of adc/adp
$adxpath = $fpath

# If the bin directory doesn't exist, create it
if(!(Test-Path $bpath)){
    New-Item -Path "$($realpath)" -Name "bin" -ItemType "directory"
}

# compress files and folders to directoryname.zip
$compress = @{
  Path = "$($realpath)\resources", "$($realpath)\config.xml", "$($realpath)\changelog.md", "$($realpath)\README.md"
  CompressionLevel = "Fastest"
  DestinationPath = $zpath
}
Compress-Archive @compress -force

# conditions to check whether the adx-folder is an adp or adc
if(Test-Path $fpath){
	Remove-Item $fpath -verbose
}
if(Test-Path $fpath2){
	Remove-Item $fpath2 -verbose
	$adxpath = $fpath2	
}

#change the file-type .zip to .adc or .adp
Rename-Item $zpath -NewName $adxpath	
