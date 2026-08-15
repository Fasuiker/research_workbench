using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

internal static class WindowsFileReveal
{
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SHParseDisplayName(string name, IntPtr bindingContext, out IntPtr pidl, uint attributes, out uint attributesOut);

    [DllImport("shell32.dll")]
    private static extern IntPtr ILFindLastID(IntPtr pidl);

    [DllImport("shell32.dll")]
    private static extern int SHOpenFolderAndSelectItems(IntPtr folderPidl, uint itemCount, IntPtr[] itemPidls, uint flags);

    [DllImport("ole32.dll")]
    private static extern void CoTaskMemFree(IntPtr ptr);

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder className, int maxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxCount);

    [DllImport("user32.dll")]
    private static extern bool ShowWindowAsync(IntPtr hWnd, int command);

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [STAThread]
    private static int Main(string[] args)
    {
        if (args.Length != 1 || !File.Exists(args[0])) return 2;
        string target = Path.GetFullPath(args[0]);
        string parent = Path.GetDirectoryName(target);
        string folderName = Path.GetFileName(parent);
        IntPtr folderPidl = IntPtr.Zero;
        IntPtr itemPidl = IntPtr.Zero;
        uint attributes = 0;
        try
        {
            if (SHParseDisplayName(parent, IntPtr.Zero, out folderPidl, 0, out attributes) != 0) return 3;
            if (SHParseDisplayName(target, IntPtr.Zero, out itemPidl, 0, out attributes) != 0) return 4;
            IntPtr childPidl = ILFindLastID(itemPidl);
            if (SHOpenFolderAndSelectItems(folderPidl, 1, new[] { childPidl }, 0) != 0) return 5;

            Thread.Sleep(120);
            EnumWindows(delegate(IntPtr hWnd, IntPtr unused)
            {
                var className = new StringBuilder(64);
                GetClassName(hWnd, className, className.Capacity);
                if (!string.Equals(className.ToString(), "CabinetWClass", StringComparison.Ordinal)) return true;
                var title = new StringBuilder(512);
                GetWindowText(hWnd, title, title.Capacity);
                if (title.ToString().IndexOf(folderName, StringComparison.OrdinalIgnoreCase) < 0) return true;
                ShowWindowAsync(hWnd, 9);
                SetForegroundWindow(hWnd);
                return false;
            }, IntPtr.Zero);
            return 0;
        }
        finally
        {
            if (folderPidl != IntPtr.Zero) CoTaskMemFree(folderPidl);
            if (itemPidl != IntPtr.Zero) CoTaskMemFree(itemPidl);
        }
    }
}
