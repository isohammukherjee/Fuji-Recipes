"""Build the shared React application into a signed, installable Android APK.
Requires JDK 17+, Android platform 36, build-tools 36.0.0, and installed Node deps.
No Gradle dependency resolution is needed. See android/README.md.
"""
from pathlib import Path
import argparse,os,subprocess,zipfile,shutil,urllib.request
root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('--sdk',default=os.environ.get('ANDROID_SDK_ROOT','/workspace/android-sdk'));p.add_argument('--keystore',required=True);p.add_argument('--output',required=True);args=p.parse_args()
sdk=Path(args.sdk);tools=sdk/'build-tools/36.0.0';jar=sdk/'platforms/android-36/android.jar';work=root/'android/build';key=Path(args.keystore);output=Path(args.output)
def run(cmd,**kw):subprocess.run([str(x) for x in cmd],cwd=root,check=True,**kw)
run(['node','node_modules/vite/bin/vite.js','build','--config','android/vite.config.ts'])
if work.exists():shutil.rmtree(work)
(work/'classes').mkdir(parents=True);(work/'dex').mkdir();assets=root/'android/app/src/main/assets';res=root/'android/app/src/main/res'
run([tools/'aapt2','compile','--dir',res,'-o',work/'resources.zip'])
run([tools/'aapt2','link','-o',work/'unsigned.apk','-I',jar,'--manifest',root/'android/app/src/main/AndroidManifest.xml','-A',assets,'--min-sdk-version','26','--target-sdk-version','35',work/'resources.zip'])
java=list((root/'android/app/src/main/java').rglob('*.java'))
if shutil.which('javac'):
 run(['javac','-source','8','-target','8','-bootclasspath',jar,'-d',work/'classes',*java])
else:
 compiler=sdk/'ecj-3.42.0.jar'
 if not compiler.exists():compiler.write_bytes(urllib.request.urlopen('https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.42.0/ecj-3.42.0.jar').read())
 run(['java','-jar',compiler,'-8','-bootclasspath',jar,'-d',work/'classes',*java])
run([tools/'d8','--lib',jar,'--min-api','26','--output',work/'dex',*list((work/'classes').rglob('*.class'))])
with zipfile.ZipFile(work/'unsigned.apk','a') as z:z.write(work/'dex/classes.dex','classes.dex')
run([tools/'zipalign','-f','-P','16','4',work/'unsigned.apk',work/'aligned.apk'])
env=dict(os.environ);env.setdefault('FUJI_SIGNING_PASSWORD','android')
if not key.exists():
 key.parent.mkdir(parents=True,exist_ok=True)
 run(['keytool','-genkeypair','-keystore',key,'-alias','fuji-recipes','-keyalg','RSA','-keysize','2048','-validity','10000','-storepass:env','FUJI_SIGNING_PASSWORD','-keypass:env','FUJI_SIGNING_PASSWORD','-dname','CN=Fuji Recipes Development, OU=Photography, O=Soham, C=IN'],env=env)
 key.chmod(0o600)
output.parent.mkdir(parents=True,exist_ok=True)
run([tools/'apksigner','sign','--ks',key,'--ks-key-alias','fuji-recipes','--ks-pass','env:FUJI_SIGNING_PASSWORD','--key-pass','env:FUJI_SIGNING_PASSWORD','--out',output,work/'aligned.apk'],env=env)
run([tools/'apksigner','verify','--verbose','--print-certs',output]);run([tools/'zipalign','-c','-P','16','4',output])
print('APK:',output,'bytes:',output.stat().st_size)
