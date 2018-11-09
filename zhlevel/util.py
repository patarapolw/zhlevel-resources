def progress_bar(it, **kwargs):
    try:
        from tqdm import tqdm
        return tqdm(it, **kwargs)
    except ImportError:
        return it
